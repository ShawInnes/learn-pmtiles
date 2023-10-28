import {useState} from 'react';
import {Tooltip, UnstyledButton, Stack, rem, useMantineColorScheme} from '@mantine/core';
import {
  IconHome2,
  IconSettings,
  IconLogout,
   IconHome, IconMoon, IconSun,
} from '@tabler/icons-react';
import classes from './Navbar.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;

  onClick?(): void;
}

function NavbarLink({icon: Icon, label, active, onClick}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{duration: 0}}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon style={{width: rem(20), height: rem(20)}} stroke={1.5}/>
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  {icon: IconHome, label: 'Home'},
  // {icon: IconDeviceDesktopAnalytics, label: 'Analytics'},
  {icon: IconSettings, label: 'Settings'},
];

export function NavbarMinimal() {
  const [active, setActive] = useState(0);
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={colorScheme === 'light' ? IconMoon : IconSun} label="Toggle Color Scheme"
                    onClick={() => toggleColorScheme()}/>
        <NavbarLink icon={IconLogout} label="Logout"/>
      </Stack>
    </nav>
  );
}