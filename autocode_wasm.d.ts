/* tslint:disable */
/* eslint-disable */

export class MachineState {
    free(): void;
    [Symbol.dispose](): void;
    get_memory_cell(addr: number): bigint;
    get_trace_step(idx: number): StepResult;
    memory_json(): string;
    memory_len(): number;
    constructor();
    self_mod_json(): string;
    set_memory_cell(addr: number, val: bigint): void;
    trace_json(): string;
    trace_len(): number;
    halted: boolean;
    pc: number;
    step_count: number;
}

export class StepResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    a: number;
    after_b: bigint;
    b: number;
    before_a: bigint;
    before_b: bigint;
    branch_taken: boolean;
    c: number;
    pc: number;
    step: number;
}

export function compile_and_run(source: string): MachineState;

export function compile_source(source: string): string;

export function parse_single_line(line: string): string;

export function run_step_by_step(source: string, max_steps: number): MachineState;

export function self_mod_analysis(source: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_machinestate_halted: (a: number) => number;
    readonly __wbg_get_machinestate_pc: (a: number) => number;
    readonly __wbg_get_machinestate_step_count: (a: number) => number;
    readonly __wbg_get_stepresult_a: (a: number) => number;
    readonly __wbg_get_stepresult_after_b: (a: number) => bigint;
    readonly __wbg_get_stepresult_b: (a: number) => number;
    readonly __wbg_get_stepresult_before_a: (a: number) => bigint;
    readonly __wbg_get_stepresult_before_b: (a: number) => bigint;
    readonly __wbg_get_stepresult_branch_taken: (a: number) => number;
    readonly __wbg_get_stepresult_c: (a: number) => number;
    readonly __wbg_get_stepresult_pc: (a: number) => number;
    readonly __wbg_get_stepresult_step: (a: number) => number;
    readonly __wbg_machinestate_free: (a: number, b: number) => void;
    readonly __wbg_set_machinestate_halted: (a: number, b: number) => void;
    readonly __wbg_set_machinestate_pc: (a: number, b: number) => void;
    readonly __wbg_set_machinestate_step_count: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_a: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_after_b: (a: number, b: bigint) => void;
    readonly __wbg_set_stepresult_b: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_before_a: (a: number, b: bigint) => void;
    readonly __wbg_set_stepresult_before_b: (a: number, b: bigint) => void;
    readonly __wbg_set_stepresult_branch_taken: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_c: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_pc: (a: number, b: number) => void;
    readonly __wbg_set_stepresult_step: (a: number, b: number) => void;
    readonly __wbg_stepresult_free: (a: number, b: number) => void;
    readonly compile_and_run: (a: number, b: number) => number;
    readonly compile_source: (a: number, b: number) => [number, number];
    readonly machinestate_get_memory_cell: (a: number, b: number) => bigint;
    readonly machinestate_get_trace_step: (a: number, b: number) => number;
    readonly machinestate_memory_json: (a: number) => [number, number];
    readonly machinestate_memory_len: (a: number) => number;
    readonly machinestate_new: () => number;
    readonly machinestate_self_mod_json: (a: number) => [number, number];
    readonly machinestate_set_memory_cell: (a: number, b: number, c: bigint) => void;
    readonly machinestate_trace_json: (a: number) => [number, number];
    readonly machinestate_trace_len: (a: number) => number;
    readonly parse_single_line: (a: number, b: number) => [number, number];
    readonly run_step_by_step: (a: number, b: number, c: number) => number;
    readonly self_mod_analysis: (a: number, b: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
