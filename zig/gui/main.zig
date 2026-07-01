// Bit8maker — Zig + raylib GUI (native desktop port, first increment).
// A 6x16 step grid you click to toggle; Play renders the pattern with the same
// procedural voices and loops it. Build: `zig build run` (fetches + builds raylib).
const std = @import("std");
const rl = @cImport({
    @cInclude("raylib.h");
});

const SR: f32 = 44100.0;
const STEPS: usize = 16;
const ROWS: usize = 6;
const LABELS = [ROWS][*c]const u8{ "Kick", "Snare", "HiHat", "Clap", "Bass", "Synth" };
const VOL = [ROWS]f32{ 0.9, 0.8, 0.6, 0.7, 0.8, 0.5 };

var pattern: [ROWS][STEPS]bool = std.mem.zeroes([ROWS][STEPS]bool);
var bpm: i32 = 100;
var playing: bool = false;
var sound: rl.Sound = undefined;
var have_sound: bool = false;

fn col(hex: u32) rl.Color {
    return rl.Color{ .r = @intCast((hex >> 16) & 0xff), .g = @intCast((hex >> 8) & 0xff), .b = @intCast(hex & 0xff), .a = 255 };
}
const BG = col(0x0e0e10);
const CARD = col(0x15161a);
const LINE = col(0x23262e);
const BRAND = col(0x267db7);
const BRAND_L = col(0x5aa6da);
const CELL = col(0x1c1f27);
const TXT = col(0xeef2f6);
const MUTED = col(0x8b97a4);

// ---- synth voices (same math as the web / CLI renderer) ----
var rng: u64 = 0x2545F4914F6CDD1D;
fn noise() f32 {
    rng = rng *% 6364136223846793005 +% 1442695040888963407;
    const x: u32 = @truncate(rng >> 33);
    return @as(f32, @floatFromInt(x)) / 1073741823.5 - 1.0;
}
fn env(t: f32, k: f32) f32 {
    return @exp(-t * k);
}
fn addKick(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.32 * SR);
    var ph: f32 = 0;
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        ph += 2.0 * std.math.pi * (50.0 + 100.0 * env(t, 30)) / SR;
        b[s + i] += @sin(ph) * env(t, 12) * v;
    }
}
fn addSnare(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.2 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += (@sin(2.0 * std.math.pi * 180.0 * t) * env(t, 25) * 0.4 + noise() * env(t, 20) * 0.7) * v;
    }
}
fn addHat(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.06 * SR);
    var prev: f32 = 0;
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        const x = noise();
        b[s + i] += (x - prev) * env(t, 80) * 0.4 * v;
        prev = x;
    }
}
fn addClap(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.18 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += noise() * env(t, 20) * 0.6 * v;
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
        b[s + i] += tri(55.0, t) * env(t, 8) * 0.9 * v;
    }
}
fn addSynth(b: []f32, s: usize, v: f32) void {
    const n: usize = @intFromFloat(0.25 * SR);
    var i: usize = 0;
    while (i < n and s + i < b.len) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / SR;
        b[s + i] += saw(330.0, t) * env(t, 10) * 0.5 * v;
    }
}

fn renderCurrent(alloc: std.mem.Allocator) ![]i16 {
    const step_samples: usize = @intFromFloat((60.0 / @as(f32, @floatFromInt(bpm))) / 4.0 * SR);
    const n = STEPS * step_samples + @as(usize, @intFromFloat(0.3 * SR));
    const buf = try alloc.alloc(f32, n);
    defer alloc.free(buf);
    @memset(buf, 0);
    var st: usize = 0;
    while (st < STEPS) : (st += 1) {
        const off = st * step_samples;
        if (pattern[0][st]) addKick(buf, off, VOL[0]);
        if (pattern[1][st]) addSnare(buf, off, VOL[1]);
        if (pattern[2][st]) addHat(buf, off, VOL[2]);
        if (pattern[3][st]) addClap(buf, off, VOL[3]);
        if (pattern[4][st]) addBass(buf, off, VOL[4]);
        if (pattern[5][st]) addSynth(buf, off, VOL[5]);
    }
    const out = try alloc.alloc(i16, n);
    for (buf, 0..) |sv, i| {
        var x = sv;
        if (x > 1.0) x = 1.0;
        if (x < -1.0) x = -1.0;
        out[i] = @intFromFloat(x * 32767.0);
    }
    return out;
}

fn startPlay(alloc: std.mem.Allocator) void {
    const samples = renderCurrent(alloc) catch return;
    defer alloc.free(samples);
    const wave = rl.Wave{
        .frameCount = @intCast(samples.len),
        .sampleRate = 44100,
        .sampleSize = 16,
        .channels = 1,
        .data = @ptrCast(samples.ptr),
    };
    if (have_sound) rl.UnloadSound(sound);
    sound = rl.LoadSoundFromWave(wave); // copies the samples internally
    have_sound = true;
    rl.PlaySound(sound);
    playing = true;
}
fn stopPlay() void {
    if (have_sound) rl.StopSound(sound);
    playing = false;
}

fn button(x: i32, y: i32, w: i32, h: i32, label: [*c]const u8, filled: bool) bool {
    const m = rl.GetMousePosition();
    const over = m.x >= @as(f32, @floatFromInt(x)) and m.x <= @as(f32, @floatFromInt(x + w)) and
        m.y >= @as(f32, @floatFromInt(y)) and m.y <= @as(f32, @floatFromInt(y + h));
    if (filled) {
        rl.DrawRectangle(x, y, w, h, if (over) BRAND_L else BRAND);
    } else {
        rl.DrawRectangleLines(x, y, w, h, LINE);
    }
    const tw = rl.MeasureText(label, 18);
    rl.DrawText(label, x + @divTrunc(w - tw, 2), y + @divTrunc(h - 18, 2), 18, if (filled) TXT else col(0xcfd6dd));
    return over and rl.IsMouseButtonPressed(rl.MOUSE_BUTTON_LEFT);
}

pub fn main() void {
    const alloc = std.heap.c_allocator;
    // a little demo pattern
    pattern[0][0] = true;
    pattern[0][4] = true;
    pattern[0][8] = true;
    pattern[0][12] = true;
    pattern[2][2] = true;
    pattern[2][6] = true;
    pattern[2][10] = true;
    pattern[2][14] = true;
    pattern[1][4] = true;
    pattern[1][12] = true;

    const W: i32 = 900;
    const H: i32 = 560;
    rl.InitWindow(W, H, "Bit8maker — Zig + raylib");
    rl.InitAudioDevice();
    rl.SetTargetFPS(60);

    const label_w: i32 = 88;
    const grid_x: i32 = 24 + label_w + 12;
    const grid_top: i32 = 150;
    const cell: i32 = 40;
    const gap: i32 = 6;
    const row_h: i32 = cell + gap;

    while (!rl.WindowShouldClose()) {
        // loop playback
        if (playing and have_sound and !rl.IsSoundPlaying(sound)) rl.PlaySound(sound);

        // transport
        if (button(24, 92, 120, 40, if (playing) "Stop" else "Play", true)) {
            if (playing) stopPlay() else startPlay(alloc);
        }
        if (button(156, 92, 100, 40, "Clear", false)) {
            pattern = std.mem.zeroes([ROWS][STEPS]bool);
        }
        if (button(268, 92, 44, 40, "-", false)) bpm = @max(60, bpm - 5);
        if (button(380, 92, 44, 40, "+", false)) bpm = @min(250, bpm + 5);

        // grid clicks
        if (rl.IsMouseButtonPressed(rl.MOUSE_BUTTON_LEFT)) {
            const mx: i32 = rl.GetMouseX();
            const my: i32 = rl.GetMouseY();
            var r: usize = 0;
            while (r < ROWS) : (r += 1) {
                const ry = grid_top + @as(i32, @intCast(r)) * row_h;
                if (my >= ry and my < ry + cell) {
                    var c: usize = 0;
                    while (c < STEPS) : (c += 1) {
                        const cx = grid_x + @as(i32, @intCast(c)) * (cell + gap);
                        if (mx >= cx and mx < cx + cell) pattern[r][c] = !pattern[r][c];
                    }
                }
            }
        }

        rl.BeginDrawing();
        rl.ClearBackground(BG);
        rl.DrawText("Bit8maker", 24, 28, 40, TXT);
        rl.DrawText("8", 24 + rl.MeasureText("Bit", 40), 28, 40, BRAND);
        rl.DrawText(rl.TextFormat("BPM %d", bpm), 440, 104, 20, MUTED);

        var r: usize = 0;
        while (r < ROWS) : (r += 1) {
            const ry = grid_top + @as(i32, @intCast(r)) * row_h;
            rl.DrawText(LABELS[r], 24, ry + 10, 18, col(0xcfd6dd));
            var c: usize = 0;
            while (c < STEPS) : (c += 1) {
                const cx = grid_x + @as(i32, @intCast(c)) * (cell + gap);
                const on = pattern[r][c];
                rl.DrawRectangle(cx, ry, cell, cell, if (on) BRAND else CELL);
                rl.DrawRectangleLines(cx, ry, cell, cell, if (on) BRAND_L else col(0x2a2e38));
            }
        }
        rl.DrawText("Zig + raylib · click cells, Play to hear", 24, H - 34, 16, MUTED);
        rl.EndDrawing();
    }

    if (have_sound) rl.UnloadSound(sound);
    rl.CloseAudioDevice();
    rl.CloseWindow();
}
