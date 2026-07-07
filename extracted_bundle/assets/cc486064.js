/* @ds-bundle: {"format":4,"namespace":"AppleIOS26DesignSystem_019dfd","components":[],"sourceHashes":{"ui_kits/ios/App.jsx":"8a8b6f39aac3","ui_kits/ios/IOSPrimitives.jsx":"6825fec65ede","ui_kits/ios/ios-frame.jsx":"d67eb3ffe562"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AppleIOS26DesignSystem_019dfd = window.AppleIOS26DesignSystem_019dfd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/ios/App.jsx
try { (() => {
// App.jsx — interactive iOS 26 demo. Switch between Home, Settings, Photos, Messages.
const {
  useState
} = React;
function HomeScreen({
  go
}) {
  const apps = [{
    name: 'Photos',
    bg: 'linear-gradient(135deg,#FFD60A,#FF3B30 25%,#AF52DE 55%,#007AFF 85%)',
    go: 'photos'
  }, {
    name: 'Messages',
    bg: 'linear-gradient(180deg,#5AF768,#00BD2D)',
    go: 'messages'
  }, {
    name: 'Settings',
    bg: 'linear-gradient(180deg,#B5B5BB,#6A6A6E)',
    go: 'settings'
  }, {
    name: 'Music',
    bg: 'linear-gradient(180deg,#FE2D55,#FA233B)'
  }, {
    name: 'Mail',
    bg: 'linear-gradient(180deg,#1FB4FF,#0080FF)'
  }, {
    name: 'Notes',
    bg: 'linear-gradient(180deg,#FFE15D,#FFB200)'
  }, {
    name: 'Camera',
    bg: '#1c1c1e'
  }, {
    name: 'Safari',
    bg: 'radial-gradient(circle at 50% 50%,#F5F5F7 38%,transparent 38%),conic-gradient(from -45deg,#1C9CFF,#0064D2,#1C9CFF)'
  }, {
    name: 'Maps',
    bg: 'linear-gradient(180deg,#A1E37D,#1B7A41)'
  }, {
    name: 'App Store',
    bg: 'linear-gradient(180deg,#3DB7FF,#1268EF)'
  }, {
    name: 'Wallet',
    bg: 'linear-gradient(180deg,#1C1C1E,#3a3a3c)'
  }, {
    name: 'Health',
    bg: '#fff'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, {
    dark: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 18,
      padding: '24px 28px'
    }
  }, apps.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.name,
    onClick: () => a.go && go(a.go),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      cursor: a.go ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: '22.5%',
      background: a.bg,
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 11px/13px Inter',
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)'
    }
  }, a.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 32px'
    }
  }, /*#__PURE__*/React.createElement(Glass, {
    radius: 32,
    style: {
      padding: 12,
      display: 'flex',
      justifyContent: 'space-around'
    }
  }, [{
    name: 'Phone',
    bg: 'linear-gradient(180deg,#5AF768,#00BD2D)'
  }, {
    name: 'Safari',
    bg: 'radial-gradient(circle at 50% 50%,#F5F5F7 38%,transparent 38%),conic-gradient(from -45deg,#1C9CFF,#0064D2,#1C9CFF)'
  }, {
    name: 'Messages',
    bg: 'linear-gradient(180deg,#5AF768,#00BD2D)',
    go: 'messages'
  }, {
    name: 'Music',
    bg: 'linear-gradient(180deg,#FE2D55,#FA233B)'
  }].map(a => /*#__PURE__*/React.createElement("div", {
    key: a.name,
    onClick: () => a.go && go(a.go),
    style: {
      width: 56,
      height: 56,
      borderRadius: '22.5%',
      background: a.bg,
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      cursor: a.go ? 'pointer' : 'default'
    }
  })))));
}
function SettingsScreen({
  go
}) {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      overflow: 'auto',
      background: IOS_GRAY6
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(NavBar, {
    title: "Settings",
    trailing: "Edit"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 100px'
    }
  }, /*#__PURE__*/React.createElement(ListGroup, null, /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u25D0",
    iconBg: "#888",
    title: "Apple ID, iCloud+"
  })), /*#__PURE__*/React.createElement(ListGroup, null, /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u2708",
    iconBg: "#FF9500",
    title: "Airplane Mode",
    chevron: false,
    accessory: /*#__PURE__*/React.createElement(Toggle, {
      on: airplane,
      onChange: setAirplane
    })
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\uD83D\uDCF6",
    iconBg: IOS_BLUE,
    title: "Wi-Fi",
    value: wifi ? 'Apple Park' : 'Off',
    onClick: () => setWifi(!wifi)
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u25CA",
    iconBg: IOS_BLUE,
    title: "Bluetooth",
    value: bt ? 'On' : 'Off',
    chevron: false,
    accessory: /*#__PURE__*/React.createElement(Toggle, {
      on: bt,
      onChange: setBt
    })
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u25C9",
    iconBg: "#34C759",
    title: "Cellular"
  })), /*#__PURE__*/React.createElement(ListGroup, null, /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u24D8",
    iconBg: IOS_GRAY,
    title: "General",
    onClick: () => go('home')
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\uD83D\uDD14",
    iconBg: IOS_RED,
    title: "Notifications"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\u25C9",
    iconBg: "#FF2D55",
    title: "Sounds & Haptics"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\uD83D\uDD05",
    iconBg: IOS_BLUE,
    title: "Display & Brightness"
  }), /*#__PURE__*/React.createElement(ListRow, {
    icon: "\uD83C\uDD7F\uFE0F",
    iconBg: "#34C759",
    title: "Privacy & Security"
  }))));
}
function PhotosScreen({
  go
}) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#88D8B0', '#B4A7D6', '#FFC0CB', '#87CEEB', '#F4A460', '#DDA0DD', '#98FB98'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      overflow: 'auto',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(NavBar, {
    title: "Library",
    leading: "Select",
    trailing: "\u2026"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 2,
      padding: '0 0 100px'
    }
  }, Array.from({
    length: 24
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: '1',
      background: `linear-gradient(135deg, ${colors[i % 12]}, ${colors[(i + 3) % 12]})`
    }
  }))));
}
function MessagesScreen({
  go
}) {
  const chats = [{
    name: 'Mom',
    last: 'Don\'t forget Sunday dinner.',
    time: '9:32 AM',
    unread: 1,
    color: '#FF6B6B'
  }, {
    name: 'Tim Cook',
    last: 'See you at the keynote.',
    time: 'Yesterday',
    unread: 0,
    color: '#4ECDC4'
  }, {
    name: 'Design Team',
    last: 'Love the new tab bar.',
    time: 'Yesterday',
    unread: 3,
    color: '#FFE66D'
  }, {
    name: 'Ana',
    last: 'Sent a photo',
    time: 'Mon',
    unread: 0,
    color: '#88D8B0'
  }, {
    name: 'Kai',
    last: 'On my way 🚲',
    time: 'Sun',
    unread: 0,
    color: '#B4A7D6'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(NavBar, {
    title: "Messages",
    leading: "Edit",
    trailing: "\u270E"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 12px',
      background: 'rgba(118,118,128,0.12)',
      borderRadius: 10,
      marginBottom: 8,
      font: '400 17px/22px Inter',
      color: 'rgba(60,60,67,0.6)'
    }
  }, "\u2315 Search")), chats.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      display: 'flex',
      gap: 12,
      padding: '10px 16px',
      alignItems: 'center',
      borderBottom: `0.5px solid ${SEPARATOR}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50,
      height: 50,
      borderRadius: 9999,
      background: c.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 17px/22px Inter'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px/18px Inter',
      color: LABEL_2
    }
  }, c.time, " \u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 15px/20px Inter',
      color: LABEL_2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.last)), c.unread > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: IOS_BLUE
    }
  }))));
}
function App() {
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('home');

  // Show wallpaper only on home screen
  const wallpaper = screen === 'home' ? '../../assets/wallpaper-ios26.jpg' : null;
  let content;
  if (screen === 'home') content = /*#__PURE__*/React.createElement(HomeScreen, {
    go: setScreen
  });else if (screen === 'settings') content = /*#__PURE__*/React.createElement(SettingsScreen, {
    go: setScreen
  });else if (screen === 'photos') content = /*#__PURE__*/React.createElement(PhotosScreen, {
    go: setScreen
  });else if (screen === 'messages') content = /*#__PURE__*/React.createElement(MessagesScreen, {
    go: setScreen
  });
  const tabs = [{
    id: 'home',
    icon: '⌂',
    label: 'Home'
  }, {
    id: 'photos',
    icon: '◫',
    label: 'Photos'
  }, {
    id: 'messages',
    icon: '◯',
    label: 'Messages'
  }, {
    id: 'settings',
    icon: '⚙',
    label: 'Settings'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 60,
      alignItems: 'center',
      padding: 60,
      justifyContent: 'center',
      minHeight: '100vh',
      flexWrap: 'wrap',
      background: 'rgb(242,242,247)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Phone, {
    wallpaper: wallpaper
  }, content, screen !== 'home' && /*#__PURE__*/React.createElement(TabBar, {
    tabs: tabs,
    current: tab,
    onChange: id => {
      setTab(id);
      setScreen(id);
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px Inter',
      color: '#666',
      textAlign: 'center',
      marginTop: 12
    }
  }, "Tap an app icon \xB7 Switch tabs \xB7 Toggle settings")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 320,
      font: '400 15px/22px Inter',
      color: '#333'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 22px/28px Inter',
      marginBottom: 12
    }
  }, "iOS 26 UI Kit"), /*#__PURE__*/React.createElement("p", null, "Click apps on the home screen. The tab bar uses the iOS 26 ", /*#__PURE__*/React.createElement("strong", null, "Liquid Glass"), " material \u2014 heavy backdrop blur over content."), /*#__PURE__*/React.createElement("p", null, "Components: ", /*#__PURE__*/React.createElement("code", null, "Phone"), ", ", /*#__PURE__*/React.createElement("code", null, "StatusBar"), ", ", /*#__PURE__*/React.createElement("code", null, "NavBar"), ", ", /*#__PURE__*/React.createElement("code", null, "TabBar"), ", ", /*#__PURE__*/React.createElement("code", null, "ListGroup"), ", ", /*#__PURE__*/React.createElement("code", null, "ListRow"), ", ", /*#__PURE__*/React.createElement("code", null, "Toggle"), ", ", /*#__PURE__*/React.createElement("code", null, "Button"), ", ", /*#__PURE__*/React.createElement("code", null, "Glass"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      fontSize: 13
    }
  }, "Type substituted with Inter (SF Pro is Apple-licensed). Icons are Unicode placeholders \u2014 replace with SF Symbols / Lucide for production.")));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/IOSPrimitives.jsx
try { (() => {
// IOSPrimitives.jsx — core iOS 26 primitives. Exports to window for cross-script use.
// Load AFTER React, before App.jsx.

const IOS_BLUE = 'rgb(0,122,255)';
const IOS_GREEN = 'rgb(52,199,89)';
const IOS_RED = 'rgb(255,59,48)';
const IOS_GRAY = 'rgb(142,142,147)';
const IOS_GRAY4 = 'rgb(209,209,214)';
const IOS_GRAY5 = 'rgb(229,229,234)';
const IOS_GRAY6 = 'rgb(242,242,247)';
const SEPARATOR = 'rgba(60,60,67,0.18)';
const LABEL_2 = 'rgba(60,60,67,0.6)';

// ---------- Status bar ----------
function StatusBar({
  dark,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 28px 4px',
      fontFamily: 'Inter, -apple-system, sans-serif',
      fontWeight: 600,
      fontSize: 16,
      color: c
    }
  }, /*#__PURE__*/React.createElement("div", null, time), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2022\u2022\u2022"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "\uD83D\uDCF6"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "\uD83D\uDD0B")));
}

// ---------- Liquid Glass surface ----------
function Glass({
  children,
  dark,
  style,
  radius = 9999
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: radius,
      background: dark ? 'rgba(28,28,30,0.55)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 0.5px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.18)',
      ...style
    }
  }, children);
}

// ---------- Button ----------
function Button({
  kind = 'filled',
  children,
  onClick,
  style
}) {
  const base = {
    border: 0,
    cursor: 'pointer',
    padding: '12px 20px',
    fontFamily: 'Inter, -apple-system, sans-serif',
    fontWeight: 600,
    fontSize: 17,
    letterSpacing: '-0.41px',
    transition: 'opacity 0.15s',
    borderRadius: 12
  };
  const styles = {
    filled: {
      ...base,
      background: IOS_BLUE,
      color: '#fff'
    },
    pill: {
      ...base,
      background: IOS_BLUE,
      color: '#fff',
      borderRadius: 9999
    },
    tinted: {
      ...base,
      background: 'rgba(0,122,255,0.15)',
      color: IOS_BLUE
    },
    gray: {
      ...base,
      background: IOS_GRAY5,
      color: '#000'
    },
    plain: {
      ...base,
      background: 'transparent',
      color: IOS_BLUE,
      padding: '10px 12px'
    },
    destructive: {
      ...base,
      background: IOS_RED,
      color: '#fff'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      ...styles[kind],
      ...style
    }
  }, children);
}

// ---------- Toggle ----------
function Toggle({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onChange(!on),
    style: {
      width: 51,
      height: 31,
      borderRadius: 9999,
      cursor: 'pointer',
      background: on ? IOS_GREEN : IOS_GRAY4,
      position: 'relative',
      transition: 'background 0.2s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 22 : 2,
      width: 27,
      height: 27,
      borderRadius: 9999,
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'left 0.2s'
    }
  }));
}

// ---------- List ----------
function ListGroup({
  header,
  children,
  footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, header && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px/16px Inter',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: LABEL_2,
      padding: '0 16px 6px'
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px/18px Inter',
      color: LABEL_2,
      padding: '6px 16px'
    }
  }, footer));
}
function ListRow({
  icon,
  iconBg = IOS_BLUE,
  title,
  value,
  chevron = true,
  onClick,
  accessory
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 16px',
      minHeight: 44,
      cursor: onClick ? 'pointer' : 'default',
      borderBottom: `0.5px solid ${SEPARATOR}`
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: iconBg,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 17px/22px Inter',
      flex: 1,
      letterSpacing: '-0.41px'
    }
  }, title), value && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 17px/22px Inter',
      color: LABEL_2
    }
  }, value), accessory, chevron && !accessory && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(60,60,67,0.3)',
      fontSize: 18
    }
  }, "\u203A"));
}

// ---------- Nav bar (Large title) ----------
function NavBar({
  title,
  leading,
  trailing,
  large = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: large ? '8px 16px 14px' : '4px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: IOS_BLUE,
      font: '400 17px/22px Inter'
    }
  }, leading), !large && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 17px/22px Inter'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: IOS_BLUE,
      font: '400 17px/22px Inter'
    }
  }, trailing)), large && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 34px/41px Inter',
      letterSpacing: 0.37,
      marginTop: 4
    }
  }, title));
}

// ---------- Tab bar (Liquid Glass capsule) ----------
function TabBar({
  tabs,
  current,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 24,
      padding: 6,
      display: 'flex',
      gap: 4,
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 0.5px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.22)'
    }
  }, tabs.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    onClick: () => onChange(t.id),
    style: {
      flex: 1,
      padding: '8px 4px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      color: current === t.id ? IOS_BLUE : LABEL_2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22
    }
  }, t.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11px/13px Inter'
    }
  }, t.label))));
}

// ---------- Phone frame ----------
function Phone({
  children,
  wallpaper
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 844,
      borderRadius: 50,
      background: '#000',
      padding: 8,
      boxShadow: '0 0 0 6px #1a1a1a, 0 30px 60px rgba(0,0,0,0.4)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: 42,
      overflow: 'hidden',
      background: wallpaper ? `url('${wallpaper}') center/cover` : '#fff',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 124,
      height: 37,
      borderRadius: 9999,
      background: '#000',
      zIndex: 100
    }
  }), children));
}

// Export
Object.assign(window, {
  IOS_BLUE,
  IOS_GREEN,
  IOS_RED,
  IOS_GRAY,
  IOS_GRAY4,
  IOS_GRAY5,
  IOS_GRAY6,
  SEPARATOR,
  LABEL_2,
  StatusBar,
  Glass,
  Button,
  Toggle,
  ListGroup,
  ListRow,
  NavBar,
  TabBar,
  Phone
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/IOSPrimitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/ios-frame.jsx", error: String((e && e.message) || e) }); }

})();
