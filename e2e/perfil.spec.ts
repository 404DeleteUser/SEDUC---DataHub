// Foto do perfil no navegador de verdade: recorte e redução em canvas.
import { expect, test } from '@playwright/test';

// PNG 1x1 fictício.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

test('a foto é reduzida, salva e continua ao reabrir o app', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Perfil/ }).click();
  await page.getByLabel('Trocar foto').setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: PNG,
  });
  const foto = page.getByRole('img', { name: 'Sua foto de perfil' });
  await expect(foto).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
  const dimensoes = await foto.evaluate((imagem: HTMLImageElement) => [
    imagem.naturalWidth,
    imagem.naturalHeight,
  ]);
  expect(dimensoes).toEqual([256, 256]);

  await page.reload();
  await page.getByRole('button', { name: /^Perfil/ }).click();
  await expect(
    page.getByRole('img', { name: 'Sua foto de perfil' })
  ).toBeVisible();
});
