import { useMemo, useState, type FormEvent } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile, validateAge, type HealthProfile } from "@/lib/store";

export function ProfileModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: HealthProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<HealthProfile>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof HealthProfile, string>>>({});

  const ageError = useMemo(() => validateAge(form.age), [form.age]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Name is required.";
    if (ageError || !form.age) newErrors.age = ageError ?? "Age is required.";
    if (!form.gender) newErrors.gender = "Select a gender.";
    if (form.phone && !/^[+\d\s\-()]{6,30}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }
    if (form.height && !/^\d{2,3}(\.\d)?$/.test(form.height)) {
      newErrors.height = "Height should be in cm (e.g. 175).";
    }
    if (form.weight && !/^\d{1,3}(\.\d)?$/.test(form.weight)) {
      newErrors.weight = "Weight should be in kg (e.g. 70).";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    updateProfile(form);
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Health profile</h2>
            <p className="text-xs text-muted-foreground">
              These details power your dashboard, summary, and emergency card.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Full name" full error={errors.fullName} required>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              maxLength={120}
              placeholder="Aarav Mehta"
            />
          </Field>
          <Field label="Age" error={errors.age} required>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              step={1}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="e.g. 32"
              className={errors.age ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </Field>
          <Field label="Gender" error={errors.gender} required>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as HealthProfile["gender"] })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </Field>
          <Field label="Blood group">
            <Input
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              maxLength={5}
              placeholder="O+, A-…"
            />
          </Field>
          <Field label="Height (cm)" error={errors.height}>
            <Input
              type="number"
              inputMode="numeric"
              min={30}
              max={260}
              step={1}
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              placeholder="175"
              className={errors.height ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </Field>
          <Field label="Weight (kg)" error={errors.weight}>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              step={0.1}
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="70"
              className={errors.weight ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={30}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </Field>
          <Field label="Last checkup">
            <Input
              type="date"
              value={form.lastCheckup}
              onChange={(e) => setForm({ ...form, lastCheckup: e.target.value })}
            />
          </Field>
          <Field label="Emergency contact" full>
            <Input
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              maxLength={120}
              placeholder="Name · phone"
            />
          </Field>
          <Field label="Allergies" full>
            <Input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              maxLength={300}
              placeholder="Penicillin, peanuts…"
            />
          </Field>
          <Field label="Conditions" full>
            <Input
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              maxLength={300}
              placeholder="Diabetes Type II…"
            />
          </Field>
          <Field label="Current medications" full>
            <Input
              value={form.medications}
              onChange={(e) => setForm({ ...form, medications: e.target.value })}
              maxLength={300}
              placeholder="Metformin 500mg, …"
            />
          </Field>
          <Field label="Address" full>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              maxLength={300}
            />
          </Field>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" />
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  full,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
