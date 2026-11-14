const profile = process.env.APP_PROFILE ?? 'prod';
if (!['dev', 'prod'].includes(profile)) {
  console.error('APP_PROFILE must be dev or prod');
  process.exit(1);
}
if (profile === 'prod' && process.env.API_BASE_URL) {
  const url = new URL(process.env.API_BASE_URL);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    console.error('Production API must use HTTPS');
    process.exit(1);
  }
}
