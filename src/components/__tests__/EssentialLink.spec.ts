import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EssentialLink from '../EssentialLink.vue';

// Define functional stubs for Quasar components
const QItemStub = {
  name: 'QItem',
  props: ['href', 'clickable', 'tag', 'target'],
  template: '<a :href="href" :data-clickable="clickable" :data-tag="tag" :data-target="target"><slot /></a>',
};

const QItemSectionStub = {
  name: 'QItemSection',
  props: ['avatar'], // Capture avatar prop if needed for assertions
  template: '<div :data-avatar="avatar"><slot /></div>',
};

const QItemLabelStub = {
  name: 'QItemLabel',
  props: ['caption'], // Capture caption prop
  template: '<div :data-caption="caption"><slot /></div>',
};

const QIconStub = {
  name: 'QIcon',
  props: ['name'],
  template: '<i class="mocked-q-icon">{{ name }}</i>', // Render name for easy check
};


describe('EssentialLink.vue', () => {
  const defaultProps = {
    title: 'Test Title',
  };

  const globalStubs = {
    'q-item': QItemStub,
    'q-item-section': QItemSectionStub,
    'q-item-label': QItemLabelStub,
    'q-icon': QIconStub,
  };

  it('renders title correctly', () => {
    const wrapper = mount(EssentialLink, {
      props: defaultProps,
      global: { stubs: globalStubs },
    });
    expect(wrapper.text()).toContain(defaultProps.title);
  });

  it('renders caption when provided', () => {
    const captionText = 'Test Caption';
    const wrapper = mount(EssentialLink, {
      props: { ...defaultProps, caption: captionText },
      global: { stubs: globalStubs },
    });
    expect(wrapper.text()).toContain(captionText);
    // Check if q-item-label with caption prop was rendered
    const captionLabel = wrapper.findAllComponents(QItemLabelStub).find(c => c.props('caption') === true || c.props('caption') === '');
    expect(captionLabel).toBeDefined();
    if (captionLabel) {
      expect(captionLabel.text()).toContain(captionText);
    }
  });

  it('renders link with correct href attribute on the q-item stub', () => {
    const linkUrl = 'https://example.com';
    const wrapper = mount(EssentialLink, {
      props: { ...defaultProps, link: linkUrl },
      global: { stubs: globalStubs },
    });
    const qItem = wrapper.findComponent(QItemStub);
    expect(qItem.props('href')).toBe(linkUrl);
  });

  it('renders icon when provided, via q-icon stub', () => {
    const iconName = 'home';
    const wrapper = mount(EssentialLink, {
      props: { ...defaultProps, icon: iconName },
      global: { stubs: globalStubs },
    });
    const iconStub = wrapper.findComponent(QIconStub);
    expect(iconStub.exists()).toBe(true);
    expect(iconStub.props('name')).toBe(iconName);
    expect(iconStub.text()).toBe(iconName); // Check rendered name in stub template
  });

  it('renders the avatar q-item-section when icon is provided', () => {
    const iconName = 'home';
    const wrapper = mount(EssentialLink, {
      props: { ...defaultProps, icon: iconName },
      global: { stubs: globalStubs },
    });
    const itemSections = wrapper.findAllComponents(QItemSectionStub);
    const avatarSection = itemSections.find(s => s.props('avatar') === true || s.props('avatar') === '');
    expect(avatarSection).toBeDefined();
    expect(avatarSection?.findComponent(QIconStub).exists()).toBe(true);
  });


  it('does not render q-icon if icon prop is not provided', () => {
    const wrapper = mount(EssentialLink, {
      props: { ...defaultProps, icon: undefined }, // Explicitly pass undefined for icon
      global: { stubs: globalStubs },
    });
    expect(wrapper.findComponent(QIconStub).exists()).toBe(false);
  });

  it('renders with default link # if link prop not provided, on q-item stub', () => {
    const wrapper = mount(EssentialLink, {
      props: defaultProps, // link prop is not provided
      global: { stubs: globalStubs },
    });
    const qItem = wrapper.findComponent(QItemStub);
    expect(qItem.props('href')).toBe('#'); // Default link value from component
  });

  it('q-item stub receives clickable prop as true', () => {
    const wrapper = mount(EssentialLink, {
      props: defaultProps,
      global: { stubs: globalStubs },
    });
    const qItem = wrapper.findComponent(QItemStub);
    // For boolean props that are present without a value, props() can return ''.
    // Their presence implies true. So, it should not be undefined or explicitly false.
    expect(qItem.props('clickable')).not.toBeUndefined();
    expect(qItem.props('clickable')).not.toBe(false);
    // More directly, if it's an empty string, that means it was present.
    expect(qItem.props('clickable') === '' || qItem.props('clickable') === true).toBe(true);
  });
});
