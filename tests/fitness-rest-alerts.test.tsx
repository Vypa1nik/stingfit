import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { RestTimer } from "@/features/fitness/RestTimer";
import { SetLogger } from "@/features/fitness/SetLogger";

class FakeAudioParam {
	setValueAtTime = vi.fn();
	exponentialRampToValueAtTime = vi.fn();
}

class FakeOscillatorNode {
	type: OscillatorType = "sine";
	frequency = new FakeAudioParam();
	connect = vi.fn();
	start = vi.fn();
	stop = vi.fn();
}

class FakeGainNode {
	gain = new FakeAudioParam();
	connect = vi.fn();
}

class FakeAudioContext {
	state: AudioContextState = "suspended";
	currentTime = 10;
	destination = {};
	resume = vi.fn(async () => {
		this.state = "running";
	});
	createOscillator = vi.fn(() => new FakeOscillatorNode());
	createGain = vi.fn(() => new FakeGainNode());
}

const audioContexts: FakeAudioContext[] = [];

class TestAudioContext extends FakeAudioContext {
	constructor() {
		super();
		audioContexts.push(this);
	}
}

function getLatestAudioContext() {
	return audioContexts[audioContexts.length - 1] ?? null;
}

async function waitForEffects() {
	await new Promise((resolve) => window.setTimeout(resolve, 0));
}

describe("rest timer alerts", () => {
	let container: HTMLDivElement;
	let root: Root;
	let vibrateSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vibrateSpy = vi.fn();
		Object.defineProperty(window.navigator, "vibrate", {
			configurable: true,
			value: vibrateSpy,
		});
		Object.defineProperty(window, "AudioContext", {
			configurable: true,
			value: TestAudioContext,
		});
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		vi.restoreAllMocks();
	});

	test("vibrates once when the rest timer reaches zero", async () => {
		const startedAt = new Date(Date.now() - 2_000).toISOString();

		await act(async () => {
			root.render(
				<RestTimer
					seconds={1}
					startedAt={startedAt}
					soundEnabled={false}
					vibrationEnabled
				/>,
			);
			await waitForEffects();
		});

		expect(container.textContent).toContain("Pauza hotová");
		expect(vibrateSpy).toHaveBeenCalledTimes(1);
		expect(vibrateSpy).toHaveBeenCalledWith([200, 100, 200]);

		await act(async () => {
			root.render(
				<RestTimer
					seconds={1}
					startedAt={startedAt}
					soundEnabled={false}
					vibrationEnabled
				/>,
			);
			await waitForEffects();
		});

		expect(vibrateSpy).toHaveBeenCalledTimes(1);
	});

	test("does not vibrate when vibration alerts are disabled", async () => {
		const startedAt = new Date(Date.now() - 2_000).toISOString();

		await act(async () => {
			root.render(
				<RestTimer
					seconds={1}
					startedAt={startedAt}
					soundEnabled={false}
					vibrationEnabled={false}
				/>,
			);
			await waitForEffects();
		});

		expect(container.textContent).toContain("Pauza hotová");
		expect(vibrateSpy).not.toHaveBeenCalled();
	});

	test("plays a WebAudio beep when the rest timer reaches zero with sound enabled", async () => {
		const startedAt = new Date(Date.now() - 2_000).toISOString();

		await act(async () => {
			root.render(
				<RestTimer
					seconds={1}
					startedAt={startedAt}
					soundEnabled
					vibrationEnabled
				/>,
			);
			await waitForEffects();
		});

		const audioContext = getLatestAudioContext();
		expect(vibrateSpy).toHaveBeenCalledWith([200, 100, 200]);
		expect(audioContext?.resume).toHaveBeenCalledTimes(1);
		expect(audioContext?.createOscillator).toHaveBeenCalledTimes(1);
		expect(audioContext?.createGain).toHaveBeenCalledTimes(1);
	});

	test("arms the WebAudio context on the first set logging tap", async () => {
		const onLog = vi.fn(async () => undefined);

		await act(async () => {
			root.render(
				<SetLogger
					displayUnit="kg"
					onLog={onLog}
					set={{
						id: "set-1",
						sessionExerciseId: "session-exercise-1",
						setNumber: 1,
						weightKg: 80,
						reps: 8,
						rir: 2,
						setType: "working",
						weightEntryMode: "total",
						leftWeightKg: null,
						rightWeightKg: null,
						status: "planned",
						completedAt: null,
						createdAt: "2026-05-05T10:00:00.000Z",
						updatedAt: "2026-05-05T10:00:00.000Z",
					}}
				/>,
			);
		});

		const logButton = Array.from(container.querySelectorAll("button")).find(
			(button) => button.textContent?.includes("Zapísať sériu"),
		);
		const existingAudioContext = getLatestAudioContext();
		if (existingAudioContext) {
			existingAudioContext.state = "suspended";
			existingAudioContext.resume.mockClear();
		}

		await act(async () => {
			logButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await waitForEffects();
		});

		expect(getLatestAudioContext()?.resume).toHaveBeenCalledTimes(1);
		expect(onLog).toHaveBeenCalledWith(
			"set-1",
			expect.objectContaining({ weightKg: 80, reps: 8, rir: 2 }),
		);
	});
});
