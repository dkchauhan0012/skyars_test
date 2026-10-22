/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MotionConfig } from 'motion/react';
import { Header } from './components/site/Header';
import { Footer } from './components/site/Footer';
import { Hero } from './sections/Hero';
import { Services } from './sections/Services';
import { SignalInterlude } from './sections/SignalInterlude';
import { Process } from './sections/Process';
import { About } from './sections/About';
import { Careers } from './sections/Careers';
import { Contact } from './sections/Contact';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <Header />
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          <Hero />
          <Services />
          <SignalInterlude />
          <Process />
          <About />
          <Careers />
          <Contact />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
