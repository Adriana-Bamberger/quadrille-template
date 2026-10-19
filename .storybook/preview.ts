import type { Preview } from '@storybook/sveltekit';
import '../src/routes/layout.css';

const preview: Preview = {
	parameters: {
		controls: { matchers: { color: /(background|colour|color)$/i } },
		// Run the accessibility checks on every story rather than on demand.
		a11y: { test: 'todo' },
		backgrounds: {
			options: {
				lilac: { name: 'Lilac (site)', value: '#d4d2e0' },
				night: { name: 'Night', value: '#1c222f' },
				light: { name: 'Light', value: '#ffffff' }
			}
		}
	},
	initialGlobals: {
		backgrounds: { value: 'lilac' }
	}
};

export default preview;
