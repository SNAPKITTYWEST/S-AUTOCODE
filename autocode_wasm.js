/* @ts-self-types="./autocode_wasm.d.ts" */

export class MachineState {
    static __wrap(ptr) {
        const obj = Object.create(MachineState.prototype);
        obj.__wbg_ptr = ptr;
        MachineStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MachineStateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_machinestate_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get halted() {
        const ret = wasm.__wbg_get_machinestate_halted(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get pc() {
        const ret = wasm.__wbg_get_machinestate_pc(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get step_count() {
        const ret = wasm.__wbg_get_machinestate_step_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} addr
     * @returns {bigint}
     */
    get_memory_cell(addr) {
        const ret = wasm.machinestate_get_memory_cell(this.__wbg_ptr, addr);
        return ret;
    }
    /**
     * @param {number} idx
     * @returns {StepResult}
     */
    get_trace_step(idx) {
        const ret = wasm.machinestate_get_trace_step(this.__wbg_ptr, idx);
        return StepResult.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    memory_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.machinestate_memory_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    memory_len() {
        const ret = wasm.machinestate_memory_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    constructor() {
        const ret = wasm.machinestate_new();
        this.__wbg_ptr = ret;
        MachineStateFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    self_mod_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.machinestate_self_mod_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} addr
     * @param {bigint} val
     */
    set_memory_cell(addr, val) {
        wasm.machinestate_set_memory_cell(this.__wbg_ptr, addr, val);
    }
    /**
     * @returns {string}
     */
    trace_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.machinestate_trace_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    trace_len() {
        const ret = wasm.machinestate_trace_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {boolean} arg0
     */
    set halted(arg0) {
        wasm.__wbg_set_machinestate_halted(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set pc(arg0) {
        wasm.__wbg_set_machinestate_pc(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set step_count(arg0) {
        wasm.__wbg_set_machinestate_step_count(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) MachineState.prototype[Symbol.dispose] = MachineState.prototype.free;

export class StepResult {
    static __wrap(ptr) {
        const obj = Object.create(StepResult.prototype);
        obj.__wbg_ptr = ptr;
        StepResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StepResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stepresult_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get a() {
        const ret = wasm.__wbg_get_stepresult_a(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {bigint}
     */
    get after_b() {
        const ret = wasm.__wbg_get_stepresult_after_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get b() {
        const ret = wasm.__wbg_get_stepresult_b(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {bigint}
     */
    get before_a() {
        const ret = wasm.__wbg_get_stepresult_before_a(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {bigint}
     */
    get before_b() {
        const ret = wasm.__wbg_get_stepresult_before_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get branch_taken() {
        const ret = wasm.__wbg_get_stepresult_branch_taken(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get c() {
        const ret = wasm.__wbg_get_stepresult_c(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get pc() {
        const ret = wasm.__wbg_get_stepresult_pc(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get step() {
        const ret = wasm.__wbg_get_stepresult_step(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set a(arg0) {
        wasm.__wbg_set_stepresult_a(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} arg0
     */
    set after_b(arg0) {
        wasm.__wbg_set_stepresult_after_b(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set b(arg0) {
        wasm.__wbg_set_stepresult_b(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} arg0
     */
    set before_a(arg0) {
        wasm.__wbg_set_stepresult_before_a(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} arg0
     */
    set before_b(arg0) {
        wasm.__wbg_set_stepresult_before_b(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set branch_taken(arg0) {
        wasm.__wbg_set_stepresult_branch_taken(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set c(arg0) {
        wasm.__wbg_set_stepresult_c(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set pc(arg0) {
        wasm.__wbg_set_stepresult_pc(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set step(arg0) {
        wasm.__wbg_set_stepresult_step(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) StepResult.prototype[Symbol.dispose] = StepResult.prototype.free;

/**
 * @param {string} source
 * @returns {MachineState}
 */
export function compile_and_run(source) {
    const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compile_and_run(ptr0, len0);
    return MachineState.__wrap(ret);
}

/**
 * @param {string} source
 * @returns {string}
 */
export function compile_source(source) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.compile_source(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} line
 * @returns {string}
 */
export function parse_single_line(line) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(line, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.parse_single_line(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} source
 * @param {number} max_steps
 * @returns {MachineState}
 */
export function run_step_by_step(source, max_steps) {
    const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.run_step_by_step(ptr0, len0, max_steps);
    return MachineState.__wrap(ret);
}

/**
 * @param {string} source
 * @returns {string}
 */
export function self_mod_analysis(source) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.self_mod_analysis(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./autocode_wasm_bg.js": import0,
    };
}

const MachineStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_machinestate_free(ptr, 1));
const StepResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stepresult_free(ptr, 1));

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('autocode_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
