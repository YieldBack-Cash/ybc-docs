import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

// `docsRoute` is '/', so these patterns match every path — routes that aren't
// docs pages have to be excluded explicitly.
const nonDocsRoute = /^\/(api|og|llms\.txt|llms-full\.txt|llms\.mdx|_next|favicon\.ico)(\/|$)/;
const docsPrefix = docsRoute === '/' ? '' : docsRoute;

const { rewrite: rewriteDocs } = rewritePath(
  `${docsPrefix}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsPrefix}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

export default function proxy(request: NextRequest) {
  if (nonDocsRoute.test(request.nextUrl.pathname)) return NextResponse.next();

  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}
