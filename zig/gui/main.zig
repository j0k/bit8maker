// Bit8maker — Zig + raylib GUI (native desktop port).
// Grid + clicks + transport + playhead, plus per-track volume, storyline
// sections (tabs/repeats), and per-section Game of Life. Build: `zig build run`.
const std = @import("std");
const rl = @cImport({
    @cInclude("raylib.h");
});

const SR: f32 = 44100.0;
const STEPS: usize = 16;
const STEPS_I: i32 = 16;
const ROWS: usize = 6;
const ROWS_I: i32 = 6;
const MAX_SEC: usize = 8;
const LABELS = [ROWS][*c]const u8{ "Kick", "Snare", "HiHat", "Clap", "Bass", "Synth" };
const MIDI_CH = [ROWS]u8{ 9, 9, 9, 9, 0, 1 }; // GM: drums on ch10; bass/synth on their own
const MIDI_NOTE = [ROWS]u8{ 36, 38, 42, 39, 33, 64 };

const Section = struct {
    pat: [ROWS][STEPS]bool = std.mem.zeroes([ROWS][STEPS]bool),
    repeat: i32 = 2,
    gol: bool = false,
};

var sections: [MAX_SEC]Section = undefined;
var n_sec: usize = 2;
var cur: usize = 0;
var vol: [ROWS]f32 = .{ 0.9, 0.8, 0.6, 0.7, 0.8, 0.5 };
var bpm: i32 = 100;
var gol_step: i32 = 16; // generations every N sixteenths

var playing: bool = false;
var sound: rl.Sound = undefined;
var have_sound: bool = false;
var play_start: f64 = 0;
var step_dur_g: f32 = 0.15;
var status_msg: [*c]const u8 = "";
var status_until: f64 = 0;
fn flash(msg: [*c]const u8) void {
    status_msg = msg;
    status_until = rl.GetTime() + 2.5;
}

// storyline cell -> (section, step) map, filled by render, used by the playhead
var seq_sec: [1024]u8 = undefined;
var seq_step: [1024]u8 = undefined;
var seq_len: usize = 1;

fn col(hex: u32) rl.Color {
    return rl.Color{ .r = @intCast((hex >> 16) & 0xff), .g = @intCast((hex >> 8) & 0xff), .b = @intCast(hex & 0xff), .a = 255 };
}
const BG = col(0x0e0e10);
const LINE = col(0x23262e);
const BRAND = col(0x267db7);
const BRAND_L = col(0x5aa6da);
const CELL = col(0x1c1f27);
const TXT = col(0xeef2f6);
const MUTED = col(0x8b97a4);
const GREEN = col(0x3fb06b);

// ---- synth voices ----
var rng: u64 = 0x2545F4914F6CDD1D;
fn noise() f32 {
    rng = rng *% 6364136223846793005 +% 1442695040888963407;
    const x: u32 = @truncate(rng >> 33);
    return @as(f32, @floatFromInt(x)) / 1073741823.5 - 1.0;
}
fn ev(t: f32, k: f32) f32 {
    return @exp(-t * k);
}
fn addKick(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.32 * SR);
    var ph: f32 = 0;
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        ph += 2.0 * std.math.pi * (50.0 + 100.0 * ev(t, 30)) / SR;
        b[s + i] += @sin(ph) * ev(t, 12) * v;
    }
}
fn addSnare(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.2 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += (@sin(2.0 * std.math.pi * 180.0 * t) * ev(t, 25) * 0.4 + noise() * ev(t, 20) * 0.7) * v;
    }
}
fn addHat(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.06 * SR);
    var prev: f32 = 0;
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        const x = noise();
        b[s + i] += (x - prev) * ev(t, 80) * 0.4 * v;
        prev = x;
    }
}
fn addClap(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.18 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += noise() * ev(t, 20) * 0.6 * v;
    }
}
fn tri(f: f32, t: f32) f32 {
    const p = t * f;
    return 2.0 * @abs(2.0 * (p - @floor(p + 0.5))) - 1.0;
}
fn saw(f: f32, t: f32) f32 {
    const p = t * f;
    return 2.0 * (p - @floor(p + 0.5));
}
fn addBass(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.32 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += tri(55.0, t) * ev(t, 8) * 0.9 * v;
    }
}
fn addSynth(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.25 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += saw(330.0, t) * ev(t, 10) * 0.5 * v;
    }
}
fn voice(idx: usize, b: []f32, s: usize) void {
    switch (idx) {
        0 => addKick(b, s, vol[0]),
        1 => addSnare(b, s, vol[1]),
        2 => addHat(b, s, vol[2]),
        3 => addClap(b, s, vol[3]),
        4 => addBass(b, s, vol[4]),
        else => addSynth(b, s, vol[5]),
    }
}

fn lifeStep(p: *[ROWS][STEPS]bool) void {
    var next: [ROWS][STEPS]bool = undefined;
    var r: usize = 0;
    while (r < ROWS) : (r += 1) {
        var c: usize = 0;
        while (c < STEPS) : (c += 1) {
            var cnt: u8 = 0;
            var dr: i32 = -1;
            while (dr <= 1) : (dr += 1) {
                var dc: i32 = -1;
                while (dc <= 1) : (dc += 1) {
                    if (dr == 0 and dc == 0) continue;
                    const rr: usize = @intCast(@mod(@as(i32, @intCast(r)) + dr, ROWS_I));
                    const cc: usize = @intCast(@mod(@as(i32, @intCast(c)) + dc, STEPS_I));
                    if (p[rr][cc]) cnt += 1;
                }
            }
            next[r][c] = if (p[r][c]) (cnt == 2 or cnt == 3) else (cnt == 3);
        }
    }
    p.* = next;
}

fn renderStoryline(alloc: std.mem.Allocator) ![]i16 {
    const step_samples: usize = @intFromFloat((60.0 / @as(f32, @floatFromInt(bpm))) / 4.0 * SR);
    // build cell -> (section, step) map
    seq_len = 0;
    var si: usize = 0;
    while (si < n_sec) : (si += 1) {
        var r: i32 = 0;
        while (r < sections[si].repeat) : (r += 1) {
            var st: usize = 0;
            while (st < STEPS and seq_len < seq_sec.len) : (st += 1) {
                seq_sec[seq_len] = @intCast(si);
                seq_step[seq_len] = @intCast(st);
                seq_len += 1;
            }
        }
    }
    if (seq_len == 0) {
        seq_sec[0] = 0;
        seq_step[0] = 0;
        seq_len = 1;
    }
    // clone sections so Game of Life evolution bakes into the render without touching the grid
    var work: [MAX_SEC]Section = undefined;
    si = 0;
    while (si < n_sec) : (si += 1) work[si] = sections[si];

    const n = seq_len * step_samples;
    const tail: usize = @intFromFloat(0.35 * SR);
    const buf = try alloc.alloc(f32, n + tail);
    defer alloc.free(buf);
    @memset(buf, 0);

    var cell: usize = 0;
    var gt: i32 = 0;
    while (cell < seq_len) : (cell += 1) {
        const csi: usize = seq_sec[cell];
        const st: usize = seq_step[cell];
        const off = cell * step_samples;
        if (gt > 0 and @rem(gt, gol_step) == 0 and work[csi].gol) lifeStep(&work[csi].pat);
        var k: usize = 0;
        while (k < ROWS) : (k += 1) {
            if (work[csi].pat[k][st]) voice(k, buf, off);
        }
        gt += 1;
    }
    var i: usize = 0;
    while (i < tail) : (i += 1) buf[i] += buf[n + i];
    const out = try alloc.alloc(i16, n);
    i = 0;
    while (i < n) : (i += 1) {
        var x = buf[i];
        if (x > 1.0) x = 1.0;
        if (x < -1.0) x = -1.0;
        out[i] = @intFromFloat(x * 32767.0);
    }
    return out;
}

fn exportWav() void {
    const alloc = std.heap.c_allocator;
    const samples = renderStoryline(alloc) catch {
        flash("export failed");
        return;
    };
    defer alloc.free(samples);
    const file = std.fs.cwd().createFile("bit8maker.wav", .{}) catch {
        flash("export failed");
        return;
    };
    defer file.close();
    var bw = std.io.bufferedWriter(file.writer());
    const w = bw.writer();
    const n: u32 = @intCast(samples.len);
    const data_len: u32 = n * 2;
    w.writeAll("RIFF") catch return;
    w.writeInt(u32, 36 + data_len, .little) catch return;
    w.writeAll("WAVE") catch return;
    w.writeAll("fmt ") catch return;
    w.writeInt(u32, 16, .little) catch return;
    w.writeInt(u16, 1, .little) catch return;
    w.writeInt(u16, 1, .little) catch return;
    w.writeInt(u32, 44100, .little) catch return;
    w.writeInt(u32, 88200, .little) catch return;
    w.writeInt(u16, 2, .little) catch return;
    w.writeInt(u16, 16, .little) catch return;
    w.writeAll("data") catch return;
    w.writeInt(u32, data_len, .little) catch return;
    for (samples) |sm| w.writeInt(i16, sm, .little) catch return;
    bw.flush() catch return;
    flash("saved bit8maker.wav");
}

const MEv = struct { tick: u32, kind: u8, ch: u8, note: u8 }; // kind: 0=off, 1=on
fn midiLess(_: void, a: MEv, b: MEv) bool {
    if (a.tick != b.tick) return a.tick < b.tick;
    return a.kind < b.kind; // note-offs before note-ons at the same tick
}
fn writeVlq(list: *std.ArrayList(u8), n0: u32) !void {
    var stack: [5]u8 = undefined;
    var sp: usize = 0;
    var n = n0;
    stack[sp] = @intCast(n & 0x7f);
    sp += 1;
    n >>= 7;
    while (n > 0) {
        stack[sp] = @intCast((n & 0x7f) | 0x80);
        sp += 1;
        n >>= 7;
    }
    while (sp > 0) {
        sp -= 1;
        try list.append(stack[sp]);
    }
}
fn exportMidi() void {
    const alloc = std.heap.c_allocator;
    const div: u32 = 96;
    const step_ticks: u32 = 24;
    const gate: u32 = 20;
    var trk = std.ArrayList(u8).init(alloc);
    defer trk.deinit();
    var events = std.ArrayList(MEv).init(alloc);
    defer events.deinit();

    const mpq: u32 = @intFromFloat(60000000.0 / @as(f32, @floatFromInt(bpm)));
    writeVlq(&trk, 0) catch return;
    trk.appendSlice(&[_]u8{ 0xff, 0x51, 0x03, @intCast((mpq >> 16) & 0xff), @intCast((mpq >> 8) & 0xff), @intCast(mpq & 0xff) }) catch return;

    var work: [MAX_SEC]Section = undefined;
    var si: usize = 0;
    while (si < n_sec) : (si += 1) work[si] = sections[si];
    var cell_idx: u32 = 0;
    var gt: i32 = 0;
    si = 0;
    while (si < n_sec) : (si += 1) {
        var r: i32 = 0;
        while (r < sections[si].repeat) : (r += 1) {
            var st: usize = 0;
            while (st < STEPS) : (st += 1) {
                if (gt > 0 and @rem(gt, gol_step) == 0 and work[si].gol) lifeStep(&work[si].pat);
                const tick = cell_idx * step_ticks;
                var k: usize = 0;
                while (k < ROWS) : (k += 1) {
                    if (work[si].pat[k][st]) {
                        events.append(.{ .tick = tick, .kind = 1, .ch = MIDI_CH[k], .note = MIDI_NOTE[k] }) catch return;
                        events.append(.{ .tick = tick + gate, .kind = 0, .ch = MIDI_CH[k], .note = MIDI_NOTE[k] }) catch return;
                    }
                }
                cell_idx += 1;
                gt += 1;
            }
        }
    }
    std.mem.sort(MEv, events.items, {}, midiLess);
    var last: u32 = 0;
    for (events.items) |e| {
        writeVlq(&trk, e.tick - last) catch return;
        last = e.tick;
        const status: u8 = (if (e.kind == 1) @as(u8, 0x90) else @as(u8, 0x80)) | e.ch;
        trk.appendSlice(&[_]u8{ status, e.note, if (e.kind == 1) @as(u8, 100) else 0 }) catch return;
    }
    writeVlq(&trk, 0) catch return;
    trk.appendSlice(&[_]u8{ 0xff, 0x2f, 0x00 }) catch return;

    const file = std.fs.cwd().createFile("bit8maker.mid", .{}) catch {
        flash("export failed");
        return;
    };
    defer file.close();
    var bw = std.io.bufferedWriter(file.writer());
    const w = bw.writer();
    const tl: u32 = @intCast(trk.items.len);
    w.writeAll(&[_]u8{ 0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, @intCast((div >> 8) & 0xff), @intCast(div & 0xff) }) catch return;
    w.writeAll(&[_]u8{ 0x4d, 0x54, 0x72, 0x6b, @intCast((tl >> 24) & 0xff), @intCast((tl >> 16) & 0xff), @intCast((tl >> 8) & 0xff), @intCast(tl & 0xff) }) catch return;
    w.writeAll(trk.items) catch return;
    bw.flush() catch return;
    flash("saved bit8maker.mid");
}

fn startPlay(alloc: std.mem.Allocator) void {
    const samples = renderStoryline(alloc) catch return;
    defer alloc.free(samples);
    const wave = rl.Wave{ .frameCount = @intCast(samples.len), .sampleRate = 44100, .sampleSize = 16, .channels = 1, .data = @ptrCast(samples.ptr) };
    if (have_sound) rl.UnloadSound(sound);
    sound = rl.LoadSoundFromWave(wave);
    have_sound = true;
    step_dur_g = (60.0 / @as(f32, @floatFromInt(bpm))) / 4.0;
    rl.PlaySound(sound);
    play_start = rl.GetTime();
    playing = true;
}
fn stopPlay() void {
    if (have_sound) rl.StopSound(sound);
    playing = false;
}

fn hovered(x: i32, y: i32, w: i32, h: i32) bool {
    const m = rl.GetMousePosition();
    return m.x >= @as(f32, @floatFromInt(x)) and m.x <= @as(f32, @floatFromInt(x + w)) and
        m.y >= @as(f32, @floatFromInt(y)) and m.y <= @as(f32, @floatFromInt(y + h));
}
fn button(x: i32, y: i32, w: i32, h: i32, label: [*c]const u8, filled: bool) bool {
    const over = hovered(x, y, w, h);
    if (filled) rl.DrawRectangle(x, y, w, h, if (over) BRAND_L else BRAND) else rl.DrawRectangleLines(x, y, w, h, LINE);
    const tw = rl.MeasureText(label, 18);
    rl.DrawText(label, x + @divTrunc(w - tw, 2), y + @divTrunc(h - 18, 2), 18, if (filled) TXT else col(0xcfd6dd));
    return over and rl.IsMouseButtonPressed(rl.MOUSE_BUTTON_LEFT);
}

pub fn main() void {
    const alloc = std.heap.c_allocator;
    // two demo sections
    sections[0] = .{ .repeat = 2 };
    sections[1] = .{ .repeat = 2 };
    for ([_]usize{ 0, 4, 8, 12 }) |i| sections[0].pat[0][i] = true;
    for ([_]usize{ 2, 6, 10, 14 }) |i| sections[0].pat[2][i] = true;
    for ([_]usize{ 4, 12 }) |i| sections[0].pat[1][i] = true;
    for ([_]usize{ 0, 8 }) |i| sections[0].pat[4][i] = true;
    var q: usize = 0;
    while (q < 16) : (q += 2) sections[1].pat[0][q] = true;
    q = 0;
    while (q < 16) : (q += 1) sections[1].pat[2][q] = true;
    for ([_]usize{ 4, 12 }) |i| sections[1].pat[1][i] = true;
    for ([_]usize{ 7, 15 }) |i| sections[1].pat[3][i] = true;
    for ([_]usize{ 0, 4, 8, 12 }) |i| sections[1].pat[4][i] = true;

    const W: i32 = 880;
    const H: i32 = 640;
    rl.InitWindow(W, H, "Bit8maker — Zig + raylib");
    rl.InitAudioDevice();
    rl.SetTargetFPS(60);

    const label_w: i32 = 62;
    const grid_x: i32 = 16 + label_w + 8;
    const grid_top: i32 = 250;
    const cellpx: i32 = 32;
    const gap: i32 = 5;
    const step_w: i32 = cellpx + gap;
    const row_h: i32 = cellpx + 8;
    const vol_x: i32 = grid_x + STEPS_I * step_w + 12;

    while (!rl.WindowShouldClose()) {
        // ---- logic (no drawing) ----
        if (playing and have_sound and !rl.IsSoundPlaying(sound)) {
            rl.PlaySound(sound);
            play_start = rl.GetTime();
        }
        var play_sec: i32 = -1;
        var play_step: i32 = -1;
        if (playing) {
            const el: f64 = rl.GetTime() - play_start;
            var c: i64 = @intFromFloat(el / @as(f64, step_dur_g));
            if (c < 0) c = 0;
            if (c >= @as(i64, @intCast(seq_len))) c = @as(i64, @intCast(seq_len)) - 1;
            const ci: usize = @intCast(c);
            play_sec = seq_sec[ci];
            play_step = seq_step[ci];
        }
        const clicked = rl.IsMouseButtonPressed(rl.MOUSE_BUTTON_LEFT);

        // ---- everything below draws; must be inside Begin/EndDrawing ----
        rl.BeginDrawing();
        rl.ClearBackground(BG);
        rl.DrawText("Bit", 16, 24, 36, TXT);
        rl.DrawText("8", 16 + rl.MeasureText("Bit", 36), 24, 36, BRAND);
        rl.DrawText("maker", 16 + rl.MeasureText("Bit8", 36), 24, 36, TXT);
        rl.DrawText(rl.TextFormat("BPM %d", bpm), 372, 104, 20, MUTED);

        // transport
        if (button(16, 92, 110, 40, if (playing) "Stop" else "Play", true)) {
            if (playing) stopPlay() else startPlay(alloc);
        }
        if (button(138, 92, 90, 40, "Clear", false)) sections[cur].pat = std.mem.zeroes([ROWS][STEPS]bool);
        if (button(240, 92, 34, 40, "-", false)) bpm = @max(60, bpm - 5);
        if (button(322, 92, 34, 40, "+", false)) bpm = @min(250, bpm + 5);
        if (button(470, 92, 64, 40, "WAV", false)) exportWav();
        if (button(546, 92, 64, 40, "MID", false)) exportMidi();

        // sections bar
        const ty: i32 = 160;
        var tx: i32 = 16;
        var s: usize = 0;
        while (s < n_sec) : (s += 1) {
            const active = s == cur;
            const w: i32 = 42;
            if (hovered(tx, ty, w, 32) and clicked) cur = s;
            rl.DrawRectangle(tx, ty, w, 32, if (active) BRAND else CELL);
            if (play_sec >= 0 and @as(usize, @intCast(play_sec)) == s) rl.DrawRectangleLines(tx, ty, w, 32, GREEN);
            const mk: [*c]const u8 = if (sections[s].gol) "*" else "";
            rl.DrawText(rl.TextFormat("%d%s", @as(c_int, @intCast(s + 1)), mk), tx + 10, ty + 7, 18, if (active) TXT else col(0xcfd6dd));
            tx += w + 6;
        }
        if (button(tx, ty, 32, 32, "+", false) and n_sec < MAX_SEC) {
            sections[n_sec] = .{ .repeat = 2 };
            cur = n_sec;
            n_sec += 1;
        }
        tx += 38;
        if (n_sec > 1 and button(tx, ty, 32, 32, "x", false)) {
            var j = cur;
            while (j + 1 < n_sec) : (j += 1) sections[j] = sections[j + 1];
            n_sec -= 1;
            if (cur >= n_sec) cur = n_sec - 1;
        }
        rl.DrawText(rl.TextFormat("rep x%d", sections[cur].repeat), 470, 167, 18, MUTED);
        if (button(560, 160, 30, 32, "-", false)) sections[cur].repeat = @max(1, sections[cur].repeat - 1);
        if (button(596, 160, 30, 32, "+", false)) sections[cur].repeat = @min(8, sections[cur].repeat + 1);
        if (button(636, 160, 90, 32, if (sections[cur].gol) "Life ON" else "Life", sections[cur].gol)) sections[cur].gol = !sections[cur].gol;
        if (button(732, 160, 44, 32, "step", false)) lifeStep(&sections[cur].pat);
        if (button(782, 160, 30, 32, "-", false)) gol_step = @max(1, gol_step - 1);
        if (button(818, 160, 30, 32, "+", false)) gol_step = @min(64, gol_step + 1);
        rl.DrawText(rl.TextFormat("life %d/16", gol_step), 636, 200, 16, MUTED);

        // grid + volume + clicks
        var r: usize = 0;
        while (r < ROWS) : (r += 1) {
            const ry = grid_top + @as(i32, @intCast(r)) * row_h;
            rl.DrawText(LABELS[r], 16, ry + 8, 16, col(0xcfd6dd));
            var c: usize = 0;
            while (c < STEPS) : (c += 1) {
                const cx = grid_x + @as(i32, @intCast(c)) * step_w;
                if (clicked and hovered(cx, ry, cellpx, cellpx)) sections[cur].pat[r][c] = !sections[cur].pat[r][c];
                const on = sections[cur].pat[r][c];
                rl.DrawRectangle(cx, ry, cellpx, cellpx, if (on) BRAND else CELL);
                rl.DrawRectangleLines(cx, ry, cellpx, cellpx, if (on) BRAND_L else col(0x2a2e38));
            }
            if (button(vol_x, ry + 3, 22, 24, "-", false)) vol[r] = @max(0.0, vol[r] - 0.1);
            if (button(vol_x + 74, ry + 3, 22, 24, "+", false)) vol[r] = @min(1.0, vol[r] + 0.1);
            rl.DrawText(rl.TextFormat("%d%%", @as(c_int, @intFromFloat(vol[r] * 100))), vol_x + 28, ry + 8, 16, MUTED);
        }

        // playhead — only when the displayed section is the one sounding
        if (playing and play_sec >= 0 and @as(usize, @intCast(play_sec)) == cur and play_step >= 0) {
            const px = grid_x + play_step * step_w - @divTrunc(gap, 2);
            rl.DrawRectangle(px, grid_top - 4, cellpx + gap, ROWS_I * row_h, rl.Color{ .r = 255, .g = 255, .b = 255, .a = 45 });
        }

        rl.DrawText("Zig + raylib · click cells · tabs = sections · WAV/MID export", 16, H - 30, 15, MUTED);
        if (rl.GetTime() < status_until) rl.DrawText(status_msg, 560, H - 30, 15, GREEN);
        rl.EndDrawing();
    }

    if (have_sound) rl.UnloadSound(sound);
    rl.CloseAudioDevice();
    rl.CloseWindow();
}
