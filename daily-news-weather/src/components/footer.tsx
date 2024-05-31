//footer

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'; //iconos de marcas 
import '@/app/globals.css';
import { useState } from 'react';

//funcion para copiar el email al clickear el mensaje
const Footer = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        const email = 'gusta.quiroga033@gmail.com'; // mi dirección de correo electrónico
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reiniciar el estado de 'copied' después de 3 segundos
    };

    //cuerpo del footer
    return (
        <footer className="bg-gray-800 bg-transparent text-white text-center py-4">
        
            <p> {/*mensaje de mi autoria y copar email */}
                Developed by Gustavo Quiroga |{' '}
                <span className="cursor-pointer underline" onClick={handleCopyEmail}>
                    Click para copiar mi email
                </span>
                
            </p>
            {/* notificacion de mensaje copiado */}
            {copied && <span className="ml-2 text-gray-500">Copiado al portapapeles</span>}

            {/* iconos con info de contacto */}
            <div className="flex justify-center mt-10">

                {/* whatsapp */}
                <a href="https://api.whatsapp.com/send?phone=5493856178160" target="_blank" rel="noopener noreferrer" className="text-white mx-2">
                    <FontAwesomeIcon icon={faWhatsapp} size="2x" />
                </a>
                {/* linkedin */}
                <a href="https://www.linkedin.com/in/gustavo-quiroga-772313200/" target="_blank" rel="noopener noreferrer" className="text-white mx-2">
                    <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
                {/* github */}
                <a href='https://github.com/guccho6w9' target='_blank' rel='noopener noreferrer' className='text-white mx-2'>
                    <FontAwesomeIcon icon={faGithub} size='2x' />

                </a>
            </div>
        </footer>
    );
};

export default Footer;
