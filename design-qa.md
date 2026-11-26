# NForce Talent doorway login — design QA

- Source visual truth: `/workspace/scratch/ceb08d2f42a2/upload/Screenshot 2026-11-24 at 12.59.17 PM.png`, with the requested removal shown separately in `/workspace/scratch/ceb08d2f42a2/upload/Screenshot 2026-11-24 at 12.57.17 PM.png`. The previously approved doorway composition remains the fixed left-side reference.
- Generated source-matched hero asset: `/workspace/scratch/ceb08d2f42a2/generated_images/exec-37a9a765-8028-42d5-8783-18ebbf48ffd1.png` (1536 × 1024), with reference UI and text removed. The deployed copy is an optimized 167 KB progressive JPEG to guarantee fast, reliable background decoding.
- Browser-rendered implementation: inspected in the cloud browser at `http://127.0.0.1:4173/`, viewport 1363 × 1023, default login state.
- Layout fidelity: passed. The implementation preserves the approximately 60/40 split and approved left doorway. The sign-in card is now materially smaller and more balanced, while retaining the warm textured background, offset charcoal plate, visible red right/bottom plate, white chamfered card, and diagonal CTA detail.
- Typography: passed. Serif display typography is limited to the editorial headline and primary welcome heading; controls use the product sans-serif stack. NForce red is consistently applied to “Talent” and “what’s next.”
- Spacing and hierarchy: passed. “NForce Talent” is larger and more prominent, “Welcome back” stays on one line in the verified desktop viewport, and the form, support copy, and protected-access note use tighter systematic spacing without clipping. Responsive breakpoints stack the hero and form at 800px and tighten both regions at 520px.
- Form states: passed. Email/password labels, visible focus styling, password visibility, remember-me, forgot-password/recovery navigation, disabled/loading/success states, Caps Lock warning, validation alerts and confirm-password visibility are retained.
- Accessibility: passed. Semantic main/sections, labeled inputs, visible focus states, ARIA live feedback, sufficient contrast and reduced-motion support remain present.
- Interaction test: password reveal changed the input type to text; remember-me became checked; forgot-password opened the recovery form; back navigation returned to sign-in.
- Console inspection: no application-origin errors or warnings. Browser-extension metadata errors were observed only from the managed browser extension and are unrelated to the app.
- Iterations: removed the conditional “HR account initialization” link from the login surface, reduced the card and backing-plate footprint, enlarged the wordmark, tightened vertical rhythm, and forced the primary welcome heading to remain a single line at desktop and mobile login widths. The approved left region was not altered.

Result: passed
