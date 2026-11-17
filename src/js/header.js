export function createHeader() {
    const sidebar = document.querySelector(".sidebar")

    sidebar.innerHTML = `
        <a class="brand" href="discover.html" aria-label="MTG Collector home">
            <span class="brand-mark">✦</span>
            <span><strong>MTG</strong><small>COLLECTOR</small></span>
        </a>
        <div class="workspace-menu">
            <p class="sidebar-label">WORKSPACE</p>
            <nav class="main-nav" aria-label="Workspace navigation">
                <a class="nav-item active" href="discover.html" aria-current="page"><span aria-hidden="true">⌕</span> Discover cards</a>
                <a class="nav-item" href="library.html"><span aria-hidden="true">▤</span> My library</a>
                <a class="nav-item" href="decks.html"><span aria-hidden="true">▦</span> Deck List</a>
                <a class="nav-item" href="deckBuilder.html"><span aria-hidden="true">✦</span> Deck Builder</a>
            </nav>
        </div>
        <div class="sidebar-bottom">
            <div class="mana-orbit" aria-hidden="true"><span>●</span><span>◆</span><span>▲</span><span>✦</span><span>☼</span></div>
            <p class="sidebar-note">Every card has a story.<br>Keep yours together.</p>
            <span class="api-note"><i></i> Powered by Scryfall</span>
        </div>
    
    `
}