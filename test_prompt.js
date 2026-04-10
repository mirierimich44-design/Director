import { regenerateImagePrompt } from './server/autoScene.js';

const script = "In the autumn of 2024, a woman in Fairfield, Connecticut named Jacqueline Crenshaw met a man on a dating app.";
const fullScript = `In the autumn of 2024, a woman in Fairfield, Connecticut named Jacqueline Crenshaw met a man on a dating app.
He said he was a widower with two children. He called often. He remembered the things she told him. Within a few weeks, he mentioned that he traded cryptocurrency on a private platform — nothing serious, he said, just a strategy his financial advisor had recommended. He showed her his returns. They were good. She was curious.
She sent forty thousand dollars to start.
The platform showed her portfolio growing. The man encouraged her to put in more. She did. Over several months, Jacqueline Crenshaw sent nearly one million dollars into an investment platform she believed was real, managed by a man she believed she knew.
Neither of them existed.
The platform was a fake — built by developers whose services were advertised openly on an online marketplace. The man was a worker in a guarded compound in Southeast Asia, running scripts he had been given, speaking to dozens of women and men like Jacqueline simultaneously, under threat of punishment if his numbers were too low. When Crenshaw tried to withdraw her money, she was told she owed taxes. Then fees. Then a minimum balance requirement. Then the account went dark.
She had lost nine hundred and eighty thousand dollars.
This documentary is about where that money went.`;

async function test() {
  const result = await regenerateImagePrompt(script, fullScript, 'VORTEXIS');
  console.log("GENERATED PROMPT:");
  console.log(result);
}
test();