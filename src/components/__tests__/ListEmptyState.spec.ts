import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ListEmptyState from '../ListEmptyState.vue';

// Define functional stubs for Quasar components
const QCardStub = {
  name: 'QCard',
  props: ['flat', 'bordered'], // Capture props if needed for assertions
  template: '<div class="mocked-q-card"><slot /></div>',
};

const QCardSectionStub = {
  name: 'QCardSection',
  template: '<div class="mocked-q-card-section"><slot /></div>',
};

const QIconStub = {
  name: 'QIcon',
  props: ['name', 'color', 'size'],
  template: '<i :class="`mocked-q-icon icon-${name} color-${color}`" :style="`font-size: ${size}`">{{ name }}</i>',
};


describe('ListEmptyState.vue', () => {
  const globalStubs = {
    'q-card': QCardStub,
    'q-card-section': QCardSectionStub,
    'q-icon': QIconStub,
  };

  it('renders with default props', () => {
    const wrapper = mount(ListEmptyState, {
      global: { stubs: globalStubs },
    });

    const icon = wrapper.findComponent(QIconStub);
    expect(icon.exists()).toBe(true);
    expect(icon.props('name')).toBe('inbox');
    expect(icon.props('color')).toBe('grey-5');
    expect(icon.props('size')).toBe('4em');
    expect(icon.text()).toBe('inbox'); // Check rendered name in stub

    expect(wrapper.text()).toContain('No items found'); // Default title
    expect(wrapper.text()).toContain('There are no items to display at the moment.'); // Default message
  });

  it('renders with custom props', () => {
    const customProps = {
      icon: 'custom-icon',
      iconColor: 'primary',
      iconSize: '5em',
      title: 'Custom Title',
      message: 'Custom message for empty state.',
    };
    const wrapper = mount(ListEmptyState, {
      props: customProps,
      global: { stubs: globalStubs },
    });

    const icon = wrapper.findComponent(QIconStub);
    expect(icon.exists()).toBe(true);
    expect(icon.props('name')).toBe(customProps.icon);
    expect(icon.props('color')).toBe(customProps.iconColor);
    expect(icon.props('size')).toBe(customProps.iconSize);
    expect(icon.text()).toBe(customProps.icon);

    expect(wrapper.text()).toContain(customProps.title);
    expect(wrapper.text()).toContain(customProps.message);
  });

  it('renders content in the actions slot', () => {
    const actionButtonText = 'Perform Action';
    const wrapper = mount(ListEmptyState, {
      global: { stubs: globalStubs },
      slots: {
        actions: `<button class="test-action-button">${actionButtonText}</button>`,
      },
    });

    const actionsContainer = wrapper.find('.empty-state-actions');
    expect(actionsContainer.exists()).toBe(true);
    const actionButton = actionsContainer.find('.test-action-button');
    expect(actionButton.exists()).toBe(true);
    expect(actionButton.text()).toBe(actionButtonText);
  });

  it('does not render actions slot container if no content is provided for the slot', () => {
    const wrapper = mount(ListEmptyState, {
      global: { stubs: globalStubs },
      // No slot content provided
    });

    const actionsSlotContainer = wrapper.find('.empty-state-actions');
    expect(actionsSlotContainer.exists()).toBe(false); // v-if="$slots.actions"
  });
});
