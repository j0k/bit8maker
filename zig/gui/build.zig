const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const raylib_dep = b.dependency("raylib", .{
        .target = target,
        .optimize = optimize,
        .linux_display_backend = .X11, // avoid needing wayland-scanner
    });
    const raylib = raylib_dep.artifact("raylib");

    const exe = b.addExecutable(.{
        .name = "bit8maker-gui",
        .root_source_file = b.path("main.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe.linkLibrary(raylib);
    exe.addIncludePath(raylib_dep.path("src"));
    exe.linkLibC();
    b.installArtifact(exe);

    const run = b.addRunArtifact(exe);
    if (b.args) |a| run.addArgs(a);
    b.step("run", "Run the Bit8maker GUI").dependOn(&run.step);
}
