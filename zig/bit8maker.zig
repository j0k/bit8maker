// Bit8maker — native Zig renderer (headless).
// Same procedural drum/synth voices as the web app; renders the demo storyline
// to a 16-bit PCM WAV. No dependencies. Build: `zig build-exe -O ReleaseFast bit8maker.zig`
const std = @import("std");

const SR: f32 = 44100.0;
const STEPS: usize = 16;
const PI: f32 = std.math.pi;

// deterministic LCG noise in ~[-1, 1] (keeps output reproducible, no std.Random dep)
var rng: u64 = 0x2545F4914F6CDD1D;
fn noise() f32 {
    rng = rng *% 6364136223846793005 +% 1442695040888963407;
    const x: u32 = @truncate(rng >> 33);
    return @as(f32, @floatFromInt(x)) / 1073741823.5 - 1.0;
}

fn addKick(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.32 * SR);
    var phase: f32 = 0;
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        const freq = 50.0 + 100.0 * @exp(-t * 30.0);
        phase += 2.0 * PI * freq / SR;
        buf[start + i] += @sin(phase) * @exp(-t * 12.0) * vol;
    }
}
fn addSnare(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.2 * SR);
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        const tone = @sin(2.0 * PI * 180.0 * t) * @exp(-t * 25.0) * 0.4;
        const nz = noise() * @exp(-t * 20.0) * 0.7;
        buf[start + i] += (tone + nz) * vol;
    }
}
fn addHat(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.06 * SR);
    var prev: f32 = 0;
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        const s = noise();
        const hp = s - prev; // crude high-pass
        prev = s;
        buf[start + i] += hp * @exp(-t * 80.0) * 0.4 * vol;
    }
}
fn addClap(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.18 * SR);
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        buf[start + i] += noise() * @exp(-t * 20.0) * 0.6 * vol;
    }
}
fn tri(freq: f32, t: f32) f32 {
    const p = t * freq;
    return 2.0 * @abs(2.0 * (p - @floor(p + 0.5))) - 1.0;
}
fn saw(freq: f32, t: f32) f32 {
    const p = t * freq;
    return 2.0 * (p - @floor(p + 0.5));
}
fn addBass(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.32 * SR);
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        buf[start + i] += tri(55.0, t) * @exp(-t * 8.0) * 0.9 * vol;
    }
}
fn addSynth(buf: []f32, start: usize, vol: f32) void {
    const n: usize = @intFromFloat(0.25 * SR);
    var i: usize = 0;
    while (i < n and start + i < buf.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        buf[start + i] += saw(330.0, t) * @exp(-t * 10.0) * 0.5 * vol;
    }
}

const Section = struct { pat: [6]u16, repeat: usize }; // pat = [kick, snare, hihat, clap, bass, synth] bitmasks
const sections = [_]Section{
    .{ .pat = .{ 4369, 4112, 17476, 0, 257, 0 }, .repeat = 2 }, // intro
    .{ .pat = .{ 21845, 4112, 65535, 32896, 4369, 17476 }, .repeat = 2 }, // drop
};
const VOL = [6]f32{ 0.9, 0.8, 0.6, 0.7, 0.8, 0.5 };

pub fn main() !void {
    const alloc = std.heap.page_allocator;
    const bpm: f32 = 100.0;
    const step_samples: usize = @intFromFloat((60.0 / bpm) / 4.0 * SR);

    var cells: usize = 0;
    for (sections) |s| cells += s.repeat * STEPS;
    const n = cells * step_samples + @as(usize, @intFromFloat(0.4 * SR));
    const buf = try alloc.alloc(f32, n);
    defer alloc.free(buf);
    @memset(buf, 0);

    var cell: usize = 0;
    for (sections) |s| {
        var r: usize = 0;
        while (r < s.repeat) : (r += 1) {
            var st: usize = 0;
            while (st < STEPS) : (st += 1) {
                const off = cell * step_samples;
                const shift: u4 = @intCast(st);
                const bit = @as(u16, 1) << shift;
                if (s.pat[0] & bit != 0) addKick(buf, off, VOL[0]);
                if (s.pat[1] & bit != 0) addSnare(buf, off, VOL[1]);
                if (s.pat[2] & bit != 0) addHat(buf, off, VOL[2]);
                if (s.pat[3] & bit != 0) addClap(buf, off, VOL[3]);
                if (s.pat[4] & bit != 0) addBass(buf, off, VOL[4]);
                if (s.pat[5] & bit != 0) addSynth(buf, off, VOL[5]);
                cell += 1;
            }
        }
    }

    const args = try std.process.argsAlloc(alloc);
    defer std.process.argsFree(alloc, args);
    const path: []const u8 = if (args.len > 1) args[1] else "bit8maker.wav";

    var file = try std.fs.cwd().createFile(path, .{});
    defer file.close();
    var bw = std.io.bufferedWriter(file.writer());
    const w = bw.writer();
    const data_len: u32 = @intCast(n * 2);
    try w.writeAll("RIFF");
    try w.writeInt(u32, 36 + data_len, .little);
    try w.writeAll("WAVE");
    try w.writeAll("fmt ");
    try w.writeInt(u32, 16, .little);
    try w.writeInt(u16, 1, .little);
    try w.writeInt(u16, 1, .little);
    try w.writeInt(u32, @intFromFloat(SR), .little);
    try w.writeInt(u32, @intFromFloat(SR * 2.0), .little);
    try w.writeInt(u16, 2, .little);
    try w.writeInt(u16, 16, .little);
    try w.writeAll("data");
    try w.writeInt(u32, data_len, .little);
    for (buf) |sm| {
        var x = sm;
        if (x > 1.0) x = 1.0;
        if (x < -1.0) x = -1.0;
        try w.writeInt(i16, @intFromFloat(x * 32767.0), .little);
    }
    try bw.flush();

    try std.io.getStdOut().writer().print(
        "bit8maker (zig) -> {s}: {d} samples, {d} Hz, bpm {d}\n",
        .{ path, n, @as(u32, @intFromFloat(SR)), @as(u32, @intFromFloat(bpm)) },
    );
}
