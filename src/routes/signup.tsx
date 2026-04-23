import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { signUp, updateProfile, validateAge } from "@/lib/store";
import { emitAuthChange } from "@/lib/useAuth";
import { Lock, Loader2, ShieldCheck, KeyRound, FileLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your health hub — MediSync" },
      { name: "description", content: "Start your personal, private medical record health hub." },
    ],
  }),
  component: SignupPage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female" | "Other">("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

  const validateNumeric = (raw: string, min: number, max: number, label: string): string => {
    if (!raw) return "";
    const n = Number(raw);
    if (!Number.isFinite(n)) return `${label} must be a number.`;
    if (n < min || n > max) return `${label} must be between ${min} and ${max}.`;
    return "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ae = validateAge(age) ?? (age ? "" : "Age is required.");
    const he = validateNumeric(height, 30, 250, "Height");
    const we = validateNumeric(weight, 1, 400, "Weight");
    setAgeError(ae || "");
    setHeightError(he);
    setWeightError(we);
    if (ae || he || we) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = signUp({ fullName: fullName.trim(), email: email.trim(), password });
      updateProfile({
        age,
        gender: gender || "",
        bloodGroup,
        height,
        weight,
      });
      emitAuthChange();
      toast.success("Health hub created", {
        description: `Welcome aboard, ${user.profile.fullName.split(" ")[0]}.`,
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg">MediSync</span>
          </Link>

          <h1 className="font-serif text-4xl text-foreground">Create your private health hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Just you. Your records. Your QR. No hospitals, no admins.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={100}
                placeholder="Aarav Mehta"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  step={1}
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (ageError) setAgeError("");
                  }}
                  required
                  placeholder="32"
                  className={ageError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {ageError && <p className="text-xs font-medium text-destructive">{ageError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female" | "Other")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Blood group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (heightError) setHeightError("");
                  }}
                  placeholder="170"
                  className={heightError ? "border-destructive" : ""}
                />
                {heightError && <p className="text-xs font-medium text-destructive">{heightError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="numeric"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (weightError) setWeightError("");
                  }}
                  placeholder="65"
                  className={weightError ? "border-destructive" : ""}
                />
                {weightError && <p className="text-xs font-medium text-destructive">{weightError}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-hero shadow-soft hover:opacity-95"
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create my health hub"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have a health hub?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-glow">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="max-w-md text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
              Built around you
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              A personal locker for everything that keeps you healthy.
            </h2>
            <ul className="mt-8 space-y-4 text-sm opacity-95">
              <Bullet icon={<FileLock className="h-4 w-4" />} text="Scans, prescriptions, lab reports — all in one place." />
              <Bullet icon={<KeyRound className="h-4 w-4" />} text="A private QR you control. Share it only when you choose." />
              <Bullet icon={<ShieldCheck className="h-4 w-4" />} text="No hospital admins. No external accounts. Just you." />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
        {icon}
      </span>
      <span>{text}</span>
    </li>
  );
}
