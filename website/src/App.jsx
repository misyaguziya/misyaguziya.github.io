import { useEffect, useReducer, useRef, useState } from 'react';
import { FolderIcon, FileTextIcon, HouseIcon, MinusIcon, SquareIcon, CopySimpleIcon, XIcon, ArrowUpRightIcon, BagIcon, StackIcon, ArrowsClockwiseIcon, CursorIcon } from '@phosphor-icons/react';
import { projects, boothUrl } from './projects.js';
import { createWindows, windowReducer } from './windowing.js';

const isVisible = (item) => item.mode === 'normal' || item.mode === 'maximized';
const initialBounds = () => ({ width: window.innerWidth, height: Math.max(400, window.innerHeight - 104) });

function ResourceLink({ label, href, project }) {
  return <a className="resource-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${project} — ${label}（新しいタブで開く）`}>
    {label}<ArrowUpRightIcon size={16} aria-hidden="true" />
  </a>;
}

function ProjectIcon({ project }) {
  return <span className={`project-icon icon-${project.id}`} aria-hidden="true"><span className="project-artwork"><img src={project.icon} alt="" decoding="async" /></span></span>;
}

function ProjectContent({ selected, onNavigate, scrollRef }) {
  return <div className="window-body">
    <nav className="sidebar" aria-label="作品ナビゲーション">
      <button className={`sidebar-link home-link ${selected === 'projects' ? 'selected' : ''}`} onClick={() => onNavigate('projects')} aria-current={selected === 'projects' ? 'page' : undefined}><HouseIcon size={21} weight="duotone" />Projects</button>
      <div className="sidebar-projects">{projects.map(project => <button className={`sidebar-link ${selected === project.id ? 'selected' : ''}`} key={project.id} onClick={() => onNavigate(project.id)} aria-current={selected === project.id ? 'location' : undefined}><ProjectIcon project={project} /><span>{project.name}</span></button>)}</div>
      <button className={`sidebar-link booth-nav ${selected === 'booth' ? 'selected' : ''}`} onClick={() => onNavigate('booth')} aria-current={selected === 'booth' ? 'location' : undefined}><BagIcon size={21} />BOOTH</button>
      <div className="sidebar-bottom"><span>misyaguziya</span><span>6 projects</span></div>
    </nav>
    <main ref={scrollRef} className="project-scroll" id="main-content" tabIndex={-1}>
      <header className="intro" id="projects" tabIndex={-1}>
        <p className="intro-eyebrow">PERSONAL REPOSITORY</p>
        <h1>misyaguziya’s Repository</h1>
        <p className="author-name">misyaguziya</p>
        <p className="intro-description">VRChat関連のソフトウェアとツールの集約ページです。</p>
      </header>
      <section aria-labelledby="projects-heading" className="projects-section">
        <div className="section-heading"><h2 id="projects-heading">Projects</h2><span>06</span></div>
        <div className="project-list">{projects.map(project => <article className={`project-row ${selected === project.id || (selected === 'projects' && project.id === 'vrct') ? 'highlighted' : ''}`} id={project.id} key={project.id} tabIndex={-1}>
          <ProjectIcon project={project} />
          <div className="project-details"><h3 className="project-name">{project.name}</h3><p>{project.description}</p><ul className="resource-list">{project.links.map(([label, href]) => <li key={href}><ResourceLink label={label} href={href} project={project.name} /></li>)}</ul></div>
        </article>)}</div>
      </section>
      <section className="booth-section" id="booth" aria-labelledby="booth-heading" tabIndex={-1}>
        <div className="section-heading"><h2 id="booth-heading">BOOTH</h2></div>
        <div className="project-row booth-row"><h3><BagIcon size={32} weight="duotone" aria-hidden="true" />BOOTH</h3><div className="project-details"><p>配布しているソフトウェアの一覧です。</p><ResourceLink label="BOOTH" href={boothUrl} project="配布ソフトウェア一覧" /></div></div>
      </section>
      <p className="content-footnote">VRChat-related software and tools</p>
    </main>
  </div>;
}

function WindowFrame({ id, title, state, active, bounds, dispatch, headerRef, children }) {
  const drag = useRef(null);
  const shown = (id === 'projects' && bounds.width <= 760) || isVisible(state);
  const maximized = state.mode === 'maximized';
  const rect = maximized ? { x: 8, y: 8, width: bounds.width - 16, height: bounds.height - 16 } : state.rect;
  function startDrag(event) {
    if (event.button !== 0 || event.target.closest('button') || maximized || window.innerWidth <= 760) return;
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, startX: rect.x, startY: rect.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event) {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    dispatch({ type: 'move', id, x: drag.current.startX + event.clientX - drag.current.x, y: drag.current.startY + event.clientY - drag.current.y, bounds });
  }
  function endDrag(event) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboardMove(event) {
    if (event.target !== event.currentTarget) return;
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key] && !maximized) {
      event.preventDefault();
      const [x, y] = directions[event.key];
      dispatch({ type: 'move', id, x: rect.x + x * (event.shiftKey ? 40 : 16), y: rect.y + y * (event.shiftKey ? 40 : 16), bounds });
    }
    if (event.key === 'Enter' && id === 'projects') { event.preventDefault(); dispatch({ type: 'maximize', id }); }
  }
  function hide(type) {
    dispatch({ type, id });
    requestAnimationFrame(() => document.querySelector(type === 'close' ? `[data-shortcut="${id}"]` : `[data-task="${id}"]`)?.focus());
  }
  return <section className={`desktop-window ${id}-window ${active ? 'active-window' : ''} ${maximized ? 'maximized' : ''}`} aria-label={`${title}ウィンドウ`} hidden={!shown} style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, zIndex: active ? 20 : id === 'projects' ? 10 : 5 }} onPointerDown={() => dispatch({ type: 'focus', id })} onFocusCapture={() => dispatch({ type: 'focus', id })}>
    <div className="window-titlebar" ref={headerRef} tabIndex={0} role="group" aria-label={`${title}。タイトルバーをドラッグ、または矢印キーで移動${id === 'projects' ? '。Enterで最大化・元に戻す' : ''}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }} onKeyDown={keyboardMove} onDoubleClick={event => { if (id === 'projects' && !event.target.closest('button')) dispatch({ type: 'maximize', id }); }}>
      <span className="window-title">{id === 'projects' ? <FolderIcon weight="duotone" size={24} /> : <FileTextIcon weight="duotone" size={17} />}<span>{title}</span></span>
      <div className="window-controls"><button onClick={() => hide('minimize')} title="最小化" aria-label={`${title}を最小化`}><MinusIcon size={19} /></button>{id === 'projects' && <button onClick={() => dispatch({ type: 'maximize', id })} title={maximized ? '元のサイズに戻す' : '最大化'} aria-label={maximized ? 'Projectsを元のサイズに戻す' : 'Projectsを最大化'}>{maximized ? <CopySimpleIcon size={18} /> : <SquareIcon size={18} />}</button>}<button className="close-window" onClick={() => hide('close')} title="閉じる" aria-label={`${title}を閉じる`}><XIcon size={19} /></button></div>
    </div>
    {children}
  </section>;
}

export function App() {
  const [bounds, setBounds] = useState(initialBounds);
  const [windows, dispatch] = useReducer(windowReducer, bounds, createWindows);
  const [selected, setSelected] = useState('projects');
  const [announcement, setAnnouncement] = useState('');
  const stageRef = useRef(null);
  const scrollRef = useRef(null);
  const projectsHeader = useRef(null);
  const readmeHeader = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      setBounds(next);
      dispatch({ type: 'resize', bounds: next });
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);
  function openWindow(id) {
    dispatch({ type: 'open', id });
    setAnnouncement(`${id === 'projects' ? 'Projects' : 'Readme'}を開きました`);
    requestAnimationFrame(() => (id === 'projects' ? projectsHeader : readmeHeader).current?.focus({ preventScroll: true }));
  }
  function navigate(id) {
    setSelected(id);
    dispatch({ type: 'open', id: 'projects' });
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      const scroller = scrollRef.current;
      if (!target || !scroller) return;
      const mobile = window.innerWidth <= 760;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (mobile) target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      else scroller.scrollTo({ top: id === 'projects' ? 0 : scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 18, behavior: reduceMotion ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
    });
  }
  function taskClick(id) {
    if (isVisible(windows[id]) && windows.active === id) {
      dispatch({ type: 'minimize', id });
      setAnnouncement(`${id}を最小化しました。タスクバーから開き直せます`);
    } else openWindow(id);
  }
  function resetLayout() {
    dispatch({ type: 'reset', bounds });
    setAnnouncement('ウィンドウの配置を元に戻しました');
  }
  return <div className="desktop">
    <a className="skip-link" href="#main-content" onClick={() => dispatch({ type: 'open', id: 'projects' })}>作品一覧へ移動</a>
    <header className="menubar"><button className="brand" onClick={() => navigate('projects')}><StackIcon size={27} weight="duotone" /><span>misyaguziya’s Repository</span></button><nav aria-label="メインナビゲーション"><button onClick={() => navigate('projects')}>Projects</button><button onClick={() => navigate('booth')}>BOOTH</button><button className="reset-layout" onClick={resetLayout} title="ウィンドウの配置をリセット" aria-label="ウィンドウの配置をリセット"><ArrowsClockwiseIcon size={20} /></button></nav></header>
    <div className="desktop-stage" ref={stageRef}>
      <div className="desktop-shortcuts" aria-label="デスクトップのショートカット"><button className="desktop-shortcut" data-shortcut="projects" onClick={() => navigate('projects')}><FolderIcon size={57} weight="duotone" /><span>Projects</span></button><button className="desktop-shortcut" onClick={() => navigate('booth')}><FolderIcon size={57} weight="duotone" /><span>BOOTH</span></button><button className="desktop-shortcut readme-shortcut" data-shortcut="readme" onClick={() => openWindow('readme')}><FileTextIcon size={48} weight="duotone" /><span>Readme</span></button></div>
      <WindowFrame id="readme" title="Readme" state={windows.readme} active={windows.active === 'readme'} bounds={bounds} dispatch={dispatch} headerRef={readmeHeader}><div className="readme-content"><p>VRChat向けの<br />便利ツールを<br />作っています。</p><span>by misyaguziya</span></div></WindowFrame>
      <WindowFrame id="projects" title="Projects — misyaguziya" state={windows.projects} active={windows.active === 'projects'} bounds={bounds} dispatch={dispatch} headerRef={projectsHeader}><ProjectContent selected={selected} onNavigate={navigate} scrollRef={scrollRef} /></WindowFrame>
      {!isVisible(windows.projects) && <div className="desktop-empty"><p>misyaguziya’s Repository</p><button onClick={() => openWindow('projects')}><FolderIcon size={23} weight="duotone" />Projectsを開く</button></div>}
      <p className="desktop-hint"><CursorIcon size={14} />タイトルバーをドラッグして移動</p>
    </div>
    <footer className="taskbar"><span className="footer-author">misyaguziya</span><div className="running-apps" aria-label="開いているウィンドウ">{['projects', 'readme'].map(id => windows[id].mode !== 'closed' ? <button data-task={id} key={id} className={`${isVisible(windows[id]) ? 'running' : ''} ${windows.active === id ? 'task-active' : ''}`} onClick={() => taskClick(id)} aria-label={`${id === 'projects' ? 'Projects' : 'Readme'}${isVisible(windows[id]) && windows.active === id ? 'を最小化' : 'を表示'}`} aria-pressed={isVisible(windows[id]) && windows.active === id}>{id === 'projects' ? <FolderIcon size={23} weight="duotone" /> : <FileTextIcon size={21} weight="duotone" />}<span>{id === 'projects' ? 'Projects' : 'Readme'}</span></button> : null)}</div><span className="footer-tagline">VRChat-related software and tools</span></footer>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </div>;
}
