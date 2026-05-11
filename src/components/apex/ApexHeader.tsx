export function ApexHeader() {
  return (
    <header className="apex-header">
      <div className="apex-header__inner">
        <div className="apex-header__logo">APEX</div>
        <div className="apex-header__status">
          <span className="apex-pulse-dot" aria-hidden />
          <span>Private access gateway — encrypted</span>
        </div>
      </div>
    </header>
  );
}
