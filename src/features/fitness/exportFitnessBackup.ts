import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import { downloadBlob } from "@/lib/download";

export async function exportFitnessBackup() {
	const exported = await fitnessRepository.exportFitnessData();
	const filename = `stingfit-fitness-export-${new Date().toISOString().slice(0, 10)}.json`;

	downloadBlob(
		new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" }),
		filename,
	);

	return filename;
}
