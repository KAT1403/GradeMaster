import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  HelpCircle, 
  ChevronDown,
  MapPin
} from "lucide-react";
import { Card } from "../../../shared/ui/card";
import { useUIStore } from "../../../app/store/uiStore";
import styles from "./InfoWidget.module.scss";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ""}`} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.faqHeader}>
        <span className={styles.question}>{question}</span>
        <ChevronDown size={20} className={styles.icon} />
      </div>
      {isOpen && <div className={styles.answer}>{answer}</div>}
    </div>
  );
};

export const InfoWidget = () => {
  const { t } = useTranslation();
  const theme = useUIStore((state) => state.theme);

  const socialLinks = [
    { 
      icon: <img src={theme === "dark" ? "/img/Github dark.png" : "/img/Github light.png"} alt="GitHub" className={styles.socialImg} />, 
      url: "https://github.com/KAT1403", 
      label: "GitHub" 
    },
    { 
      icon: <img src="/img/LinkedIn.jpg" alt="LinkedIn" className={styles.socialImg} />, 
      url: "https://www.linkedin.com/in/kim-alexey-9b1476385/", 
      label: "LinkedIn" 
    },
    { 
      icon: <img src="/img/Telegram.png" alt="Telegram" className={styles.socialImg} style={{ borderRadius: '50%' }} />, 
      url: "https://t.me/kat1403", 
      label: "Telegram" 
    },
    { 
      icon: <img src="/img/WhatsApp.png" alt="WhatsApp" className={styles.socialImg} />, 
      url: "https://wa.me/+77055809850", 
      label: "WhatsApp" 
    },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <HelpCircle size={24} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>{t("info.faq.title")}</h2>
        </div>
        <div className={styles.faqList}>
          <FAQItem question={t("info.faq.q1")} answer={t("info.faq.a1")} />
          <FAQItem question={t("info.faq.q2")} answer={t("info.faq.a2")} />
          <FAQItem question={t("info.faq.q3")} answer={t("info.faq.a3")} />
          <FAQItem question={t("info.faq.q4")} answer={t("info.faq.a4")} />
          <FAQItem question={t("info.faq.q5")} answer={t("info.faq.a5")} />
        </div>
      </section>

      <div className={styles.bottomGrid}>
        <Card className={styles.authorCard}>
          <div className={styles.authorHeader}>
            <div className={styles.authorInfo}>
              <h3 className={styles.authorName}>{t("info.author.name")}</h3>
              <p className={styles.authorStatus}>
                <MapPin size={14} className={styles.pinIcon} />
                {t("info.author.status")}
              </p>
            </div>
          </div>
          <p className={styles.authorBio}>{t("info.author.bio")}</p>
        </Card>

        <Card className={styles.contactsCard}>
          <h3 className={styles.contactsTitle}>{t("info.contacts.title")}</h3>
          <div className={styles.socialGrid}>
            {socialLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
