"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-4">
    <h2 className="font-display text-2xl text-gold gold-glow mb-4">{title}</h2>
    <div className="space-y-3 text-text/90 leading-relaxed">{children}</div>
  </motion.section>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="ml-4 list-disc text-text/90">{children}</li>
);

export default function PhilosophyPage() {
  return (
    <div>
      <PageHeader title="Ravana Philosophy" subtitle="The ambition, the journey, the principles." />

      <Section title="The ambition">
        <p>Imagine being 29 years old and having:</p>
        <ul className="space-y-1">
          <Bullet>Strong engineering skills.</Bullet>
          <Bullet>Excellent communication.</Bullet>
          <Bullet>A fit, healthy body.</Bullet>
          <Bullet>Financial independence.</Bullet>
          <Bullet>The ability to build and lead products.</Bullet>
          <Bullet>The confidence to enter a room without feeling inferior.</Bullet>
          <Bullet>Emotional stability when life becomes difficult.</Bullet>
        </ul>
      </Section>

      <Section title="The three-year journey">
        <p className="text-muted italic text-sm">
          This is a hypothetical personal development plan, not a guaranteed prediction.
        </p>

        <h3 className="font-display text-lg text-gold mt-4">Year 1 — Foundation of Power (Age 26–27)</h3>
        <p className="text-muted text-sm">Objective: Become exceptionally competent.</p>
        <p className="font-medium text-gold/90 mt-2">Career</p>
        <ul className="space-y-1">
          <Bullet>Master JavaScript, React, Next.js and TypeScript.</Bullet>
          <Bullet>Develop strong DSA and problem-solving skills.</Bullet>
          <Bullet>Study system design fundamentals.</Bullet>
          <Bullet>Independently build production-quality applications.</Bullet>
          <Bullet>Switch to a stronger engineering role.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Physical development</p>
        <ul className="space-y-1">
          <Bullet>Establish a sustainable exercise routine.</Bullet>
          <Bullet>Build strength and endurance.</Bullet>
          <Bullet>Improve posture and mobility while respecting my back.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Mental development</p>
        <ul className="space-y-1">
          <Bullet>Read every day.</Bullet>
          <Bullet>Practise concentration.</Bullet>
          <Bullet>Improve communication.</Bullet>
          <Bullet>Develop emotional stability.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Financial development</p>
        <ul className="space-y-1">
          <Bullet>Increase earning potential.</Bullet>
          <Bullet>Save consistently.</Bullet>
          <Bullet>Understand investments, taxes and personal finance.</Bullet>
        </ul>

        <h3 className="font-display text-lg text-gold mt-6">Year 2 — Expansion of Power (Age 27–28)</h3>
        <p className="text-muted text-sm">Objective: Move from being a skilled individual to someone who creates value at scale.</p>
        <p className="font-medium text-gold/90 mt-2">Career</p>
        <ul className="space-y-1">
          <Bullet>Become a strong mid-level engineer.</Bullet>
          <Bullet>Take ownership of important features.</Bullet>
          <Bullet>Develop backend and system design knowledge.</Bullet>
          <Bullet>Learn cloud infrastructure and scalability.</Bullet>
          <Bullet>Mentor other developers.</Bullet>
          <Bullet>Explore international opportunities.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Business</p>
        <ul className="space-y-1">
          <Bullet>Identify problems worth solving.</Bullet>
          <Bullet>Build one serious product.</Bullet>
          <Bullet>Learn customer research, pricing and distribution.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Personal development</p>
        <ul className="space-y-1">
          <Bullet>Improve negotiation and public speaking.</Bullet>
          <Bullet>Build meaningful professional relationships.</Bullet>
          <Bullet>Learn to make decisions under uncertainty.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Finance</p>
        <ul className="space-y-1">
          <Bullet>Increase savings.</Bullet>
          <Bullet>Build an emergency fund.</Bullet>
          <Bullet>Develop a long-term investment strategy.</Bullet>
        </ul>

        <h3 className="font-display text-lg text-gold mt-6">Year 3 — Creation of Your Own Lanka (Age 28–29)</h3>
        <p className="text-muted text-sm">Objective: Stop depending entirely on opportunities created by others. Start creating opportunities.</p>
        <p className="font-medium text-gold/90 mt-2">Career</p>
        <ul className="space-y-1">
          <Bullet>Pursue senior-level responsibilities when skills justify them.</Bullet>
          <Bullet>Lead technical decisions.</Bullet>
          <Bullet>Develop expertise in a particular engineering domain.</Bullet>
          <Bullet>Explore international positions.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Ownership</p>
        <ul className="space-y-1">
          <Bullet>Build a product with paying customers.</Bullet>
          <Bullet>Explore a startup or independent business.</Bullet>
          <Bullet>Create opportunities to generate revenue beyond salary.</Bullet>
        </ul>
        <p className="font-medium text-gold/90 mt-2">Leadership</p>
        <ul className="space-y-1">
          <Bullet>Develop a small team.</Bullet>
          <Bullet>Mentor developers.</Bullet>
          <Bullet>Help other people's careers.</Bullet>
          <Bullet>Become someone whose judgment people trust.</Bullet>
        </ul>
      </Section>

      <Section title="Seven principles">
        <ol className="space-y-1 list-decimal ml-4">
          <li>Never stop learning.</li>
          <li>Never be dependent on motivation.</li>
          <li>Never let your ego prevent you from learning.</li>
          <li>Never confuse being busy with being powerful.</li>
          <li>Never sacrifice your health to prove your ambition.</li>
          <li>Build something you own.</li>
          <li>Never become a prisoner of your desires.</li>
        </ol>
      </Section>

      <Section title="Five books">
        <ol className="space-y-1 list-decimal ml-4">
          <li><span className="text-gold">Bhagavad Gita</span> — Self-control, duty, discipline and action.</li>
          <li><span className="text-gold">Arthashastra</span> — Strategy, economics, governance and diplomacy.</li>
          <li><span className="text-gold">Valmiki Ramayana</span> — Study Rama, Ravana, Hanuman and Vibhishana.</li>
          <li><span className="text-gold">Deep Work</span> — Concentration and intellectual work.</li>
          <li><span className="text-gold">The Psychology of Money</span> — Wealth, patience, risk and financial independence.</li>
        </ol>
      </Section>

      <Section title="Personal transformation questions">
        <ul className="space-y-1">
          <Bullet>Am I becoming more knowledgeable?</Bullet>
          <Bullet>Am I becoming physically stronger?</Bullet>
          <Bullet>Am I building financial independence?</Bullet>
          <Bullet>Am I controlling my emotions?</Bullet>
          <Bullet>Am I creating something valuable?</Bullet>
          <Bullet>Am I treating people fairly?</Bullet>
          <Bullet>Am I controlling my ego?</Bullet>
        </ul>
      </Section>
    </div>
  );
}