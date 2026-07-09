pub mod manchester;
pub mod subleq;
pub mod comparative;
pub mod self_modifying;

pub use manchester::cpu::CpuState;
pub use subleq::machine::{SubleqMachine, SubleqInstr, SubleqStep, TraceEvent, MemoryWrite, SelfModificationReport, Word};
pub use comparative::{compare_execution, ComparisonReport};
pub use self_modifying::{SelfModificationAnalyzer, AnalysisResult, VerificationWitness, SealedWitness};
