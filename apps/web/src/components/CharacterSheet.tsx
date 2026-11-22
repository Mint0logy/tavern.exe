import styled from 'styled-components'

const CharacterSheet = () =>{

    return (
        <SheetFrame aria-label='Character Sheet section'>
            <Placeholder>CHARACTER SHEET</Placeholder>
        </SheetFrame>
    )
}

export default CharacterSheet

const SheetFrame = styled.section`
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    height: clamp(5.rem, 14dvh, 8rem);
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background-color: var(--color-surface);
`

const Placeholder = styled.p`
    margin: 0;
    color: var(--color-muted);
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
`