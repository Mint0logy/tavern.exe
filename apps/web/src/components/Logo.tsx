import styled from 'styled-components'

const Logo = () => {
    return (
    <LogoFrame aria-label='Tavern.exe animated logo'>
        <LogoTitle>TAVERN.EXE</LogoTitle>
    </LogoFrame>
    )
}

export default Logo

const LogoFrame = styled.header`
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    widht: 100%;
    min-height: clamp(3.5rem, 7dvh, 4.5rem);
`
const LogoTitle = styled.h1`
    margin: 0;
    color: var(--color-accent);
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    letter-spacing: 0.14em;
    line-height: 1;
`