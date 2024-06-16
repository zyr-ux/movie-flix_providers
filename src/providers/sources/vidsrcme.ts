import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

const universalScraper = async (ctx: MovieScrapeContext | ShowScrapeContext) => {
  const apiRes: { url: string } = await ctx.fetcher<{ url: string }>(
    `https://vidsrcme.wafflehacker.io/$%7Bctx.media.type === 'movie' ? 'movie' : 'tv'}`,
    {
      query: {
        tmdbId: ctx.media.tmdbId,
        ...(ctx.media.type === 'show' && {
          season: ctx.media.season.number.toString(),
          episode: ctx.media.episode.number.toString(),
        }),
      },
    },
  );

  if (!apiRes.url) throw new NotFoundError('No stream found.');

  return {
    embeds: [],
    stream: [
      {
        id: 'primary',
        type: 'hls',
        playlist: apiRes.url,
        captions: [],
        flags: [flags.CORS_ALLOWED],
      },
    ],
  } as SourcererOutput;
};

export const vidsrcWaffleHackerScraper = makeSourcerer({
  id: 'vidsrc-wafflehacker',
  name: 'Vidsrc',
  rank: 135,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  scrapeMovie: universalScraper,
  scrapeShow: universalScraper,
});
