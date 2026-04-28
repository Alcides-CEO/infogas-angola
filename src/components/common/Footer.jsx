import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="sobre">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">🔥 <span>Infogás Angola</span></div>
          <p className="footer__desc">A plataforma que conecta clientes e distribuidores de gás em Angola. Encontre, reserve e encomende gás sem sair de casa.</p>
          <a href="https://wa.me/244937999343" target="_blank" rel="noreferrer" className="footer__wa">
            📲 +244 937 999 343
          </a>
        </div>
        <div className="footer__links">
          <h4>Plataforma</h4>
          <a href="#mapa">Ver Mapa</a>
          <a href="#reservas">Reservas</a>
          <a href="/vendor/login">Área do Vendedor</a>
          <a href="/admin/login">Admin</a>
        </div>
        <div className="footer__links" id="contactos">
          <h4>Contacto</h4>
          <a href="https://wa.me/244937999343">WhatsApp</a>
          <a href="mailto:info@infogas.ao">info@infogas.ao</a>
          <a href="#">Suporte Técnico</a>
        </div>
        <div className="footer__botijas">
          <h4>Tipos de Botija</h4>
          {[
            { color: '#2563EB', label: 'Azul Grande, Média, Pequena' },
            { color: '#FF5E00', label: 'Laranja Grande, Média, Pequena' },
            { color: '#7C3AED', label: 'LEVITA' },
          ].map(b => (
            <div key={b.label} className="footer__botija">
              <span style={{ background: b.color }} className="footer__bdot" />
              {b.label}
            </div>
          ))}
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2025 Infogás Angola. Todos os direitos reservados.</span>
        <span>Feito com 🔥 em Angola</span>
      </div>
    </footer>
  );
}
