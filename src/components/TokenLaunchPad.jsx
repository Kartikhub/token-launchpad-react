

export function TokenLaunchPad() {
    return <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <input className="inputText" type="text" placeholder="Name"/><br />
        <input className="inputText" type="text" placeholder="Symbol"/><br />
        <input className="inputText" type="text" placeholder="Image url"/><br/>
        <input className="inputText" type="text" placeholder="Initial supply"/><br/>
        <button className="btn">Create a token</button>       
    </div>
}