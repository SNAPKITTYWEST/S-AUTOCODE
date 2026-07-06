use autocode_optimizer::{OptimizationPipeline, DrumGeometry};
use std::fs;
use std::path::Path;

fn main() -> anyhow::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <source.ac> [program_name] [output.json]", args[0]);
        std::process::exit(1);
    }

    let source_path = &args[1];
    let program_name = args.get(2).map(|s| s.as_str())
        .unwrap_or(Path::new(source_path).file_stem().unwrap().to_str().unwrap());
    let output_path = args.get(3).map(|s| s.as_str()).unwrap_or("latency_report.json");

    let source = fs::read_to_string(source_path)?;
    let geometry = DrumGeometry::default();

    let mut pipeline = OptimizationPipeline::new(geometry);
    let report = pipeline.run(&source, program_name)?;

    let json = serde_json::to_string_pretty(&report)?;
    fs::write(output_path, &json)?;
    println!("Report written to {}", output_path);

    if report.improvement.goal_achieved {
        println!("PASS: Latency reduction goal achieved");
    } else {
        println!("FAIL: Latency reduction goal not achieved");
    }

    Ok(())
}
