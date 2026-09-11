import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { BunnyLogo } from '@/components/bunny/BunnyLogo';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="group inline-flex items-center gap-2">
          <BunnyLogo />
          {appName}
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
