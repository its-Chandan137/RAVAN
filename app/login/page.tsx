"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Flame } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const res = await login(password);
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Invalid password");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,0,0,0.18),transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-gold mb-4 pulse-gold"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15), transparent)" }}
          >
            <Flame className="w-10 h-10 text-gold" />
          </motion.div>
          <h1 className="font-display text-5xl text-gold gold-glow tracking-widest">RAVAN</h1>
          <p className="text-muted mt-2 text-sm tracking-[0.3em] uppercase">The Path to Mastery</p>
          <p className="text-muted/70 mt-1 text-xs italic">Enter the gates of ancient Lanka</p>
        </div>

        <form onSubmit={submit} className="card p-8">
          <div className="mb-6">
            <label className="block text-sm text-muted mb-2 tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-dark" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="input-field pl-10 pr-10"
                style={{paddingLeft: "40px"}}
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-dark hover:text-gold"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-crimson-light text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg tracking-widest uppercase text-sm"
          >
            {loading ? "Entering..." : "Enter Lanka"}
          </button>
        </form>

        <p className="text-center text-muted/50 text-xs mt-6 tracking-wider">
          Only the worthy may pass
        </p>
      </motion.div>
    </div>
  );
}