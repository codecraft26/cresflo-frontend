import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function BackendTargetCard({
  backendUrl,
  onBackendUrlChange,
}: {
  backendUrl: string;
  onBackendUrlChange: (value: string) => void;
}) {
  return (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Backend target</p>
          <p className="text-xs text-[var(--ink-muted)]">
            Point the UI at the backend instance you want to exercise.
          </p>
        </div>
        <Field label="API Base URL">
          <Input
            value={backendUrl}
            onChange={(event) => onBackendUrlChange(event.target.value)}
            placeholder="http://localhost:3000"
          />
        </Field>
      </div>
    </Card>
  );
}

export { BackendTargetCard };
