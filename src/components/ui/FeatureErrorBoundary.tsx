import { Component, type ErrorInfo, type ReactNode } from "react";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface FeatureErrorBoundaryProps {
	children: ReactNode;
	featureName: string;
	description?: string;
	resetKey?: string | number | null;
}

interface FeatureErrorBoundaryState {
	hasError: boolean;
	errorMessage: string | null;
}

export class FeatureErrorBoundary extends Component<
	FeatureErrorBoundaryProps,
	FeatureErrorBoundaryState
> {
	state: FeatureErrorBoundaryState = {
		hasError: false,
		errorMessage: null,
	};

	static getDerivedStateFromError(error: Error) {
		return {
			hasError: true,
			errorMessage: error.message,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			`StingFit feature rendering failed: ${this.props.featureName}`,
			error,
			errorInfo,
		);
	}

	componentDidUpdate(previousProps: FeatureErrorBoundaryProps) {
		if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
			this.setState({ hasError: false, errorMessage: null });
		}
	}

	retry = () => {
		this.setState({ hasError: false, errorMessage: null });
	};

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<section
				role="alert"
				className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 text-fitness-warm"
			>
				<div className="flex flex-wrap items-start gap-4">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-black">
						<AlertTriangle className="size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<h2 className="text-2xl font-black tracking-[-0.04em] text-fitness-yellow">
							{formatFeatureErrorTitle(this.props.featureName)}
						</h2>
						<p className="mt-2 text-sm leading-6 text-fitness-warm/75">
							Zvyšok StingFit zostáva dostupný. Dáta sú uložené lokálne; skús
							túto časť znovu alebo prejdi na inú obrazovku.
						</p>
						{this.props.description ? (
							<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
								{this.props.description}
							</p>
						) : null}
						{this.state.errorMessage ? (
							<p className="mt-3 rounded-2xl border border-amber-400/20 bg-black/60 px-4 py-3 text-xs font-semibold text-amber-100">
								{this.state.errorMessage}
							</p>
						) : null}
						<Button
							className="mt-4"
							variant="secondary"
							leadingIcon={<RefreshCcw className="size-4" />}
							onClick={this.retry}
						>
							Skúsiť znovu
						</Button>
					</div>
				</div>
			</section>
		);
	}
}

function formatFeatureErrorTitle(featureName: string) {
	if (featureName === "Štatistiky") {
		return "Štatistiky narazili na problém";
	}

	if (featureName === "História") {
		return "História narazila na problém";
	}

	return `${featureName} narazil na problém`;
}
