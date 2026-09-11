import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Mermaid } from '@/components/mermaid';
import { HowItWorks } from '@/components/explainers/HowItWorks';
import { SplitCalculator } from '@/components/explainers/SplitCalculator';
import { MaturitySlider } from '@/components/explainers/MaturitySlider';
import { RateRatchet } from '@/components/explainers/RateRatchet';
import { FlashSwapSteps } from '@/components/explainers/FlashSwapSteps';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Mermaid,
    HowItWorks,
    SplitCalculator,
    MaturitySlider,
    RateRatchet,
    FlashSwapSteps,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
