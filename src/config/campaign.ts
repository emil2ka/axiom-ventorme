export type CampaignMode = 'preview' | 'competition';

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

const rawMode = (env.PUBLIC_VENTORME_MODE ?? 'preview').trim().toLowerCase();

export const CAMPAIGN_MODE: CampaignMode =
  rawMode === 'competition' ? 'competition' : 'preview';

export const TEAM_ID: string = (env.PUBLIC_VENTORME_TEAM_ID ?? '').trim();

export const UTM_SOURCE = 'hacknext';
export const UTM_CAMPAIGN_PREFIX = 'team-';

export const REGISTRATION_BASE: string = (
  env.PUBLIC_VENTORME_BASE ?? 'https://ventorme.ai/register'
).trim();

export function competitionCampaignValue(teamId: string = TEAM_ID): string {
  return `${UTM_CAMPAIGN_PREFIX}${teamId.trim()}`;
}

export function buildRegistrationUrl(
  mode: CampaignMode = CAMPAIGN_MODE,
  teamId: string = TEAM_ID,
  base: string = REGISTRATION_BASE,
): string {
  const url = new URL(base);
  if (mode === 'competition') {
    const team = teamId.trim();
    if (!team) {
      throw new Error(
        'competition: PUBLIC_VENTORME_TEAM_ID не задан — конкурсный выпуск без номера команды невозможен',
      );
    }
    url.searchParams.set('utm_source', UTM_SOURCE);
    url.searchParams.set('utm_campaign', competitionCampaignValue(team));
  }
  return url.toString();
}

export function registrationUrl(): string {
  return buildRegistrationUrl();
}
