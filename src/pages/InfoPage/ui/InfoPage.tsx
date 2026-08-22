import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Newspaper,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Card } from "../../../shared/ui/card";
import { useUIStore } from "../../../shared/store/uiStore";
import styles from "./InfoPage.module.scss";

const FAQ_KEYS = ["q2", "q3", "q4", "q5", "q6"] as const;

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}>
      <button
        type="button"
        className={styles.faqTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.faqQuestion}>{question}</span>
        <ChevronDown size={20} className={styles.faqChevron} />
      </button>
      {isOpen && <div className={styles.faqAnswer}>{answer}</div>}
    </div>
  );
};

export default function InfoPage() {
  const { t } = useTranslation();
  const theme = useUIStore((state) => state.theme);

  const features = [
    { key: "official",   icon: <Award      size={20} className={styles.featureIcon} /> },
    { key: "press",      icon: <Newspaper  size={20} className={styles.featureIcon} /> },
    { key: "users",      icon: <Users      size={20} className={styles.featureIcon} /> },
    { key: "reliability",icon: <ShieldCheck size={20} className={styles.featureIcon} /> },
    { key: "privacy",    icon: <Lock       size={20} className={styles.featureIcon} /> },
    { key: "openSource", icon: <Star       size={20} className={styles.featureIcon} /> },
  ];

  const socialLinks = [
    {
      label: "GitHub",
      url: "https://github.com/KAT1403",
      img: theme === "dark" ? "/img/Github dark.png" : "/img/Github light.png",
      rounded: false,
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/kim-alexey-9b1476385/",
      img: "/img/LinkedIn.jpg",
      rounded: false,
    },
    {
      label: "Telegram",
      url: "https://t.me/kat1403",
      img: "/img/Telegram.png",
      rounded: true,
    },
    {
      label: "WhatsApp",
      url: "https://wa.me/+77055809850",
      img: "/img/WhatsApp.png",
      rounded: false,
    },
    {
      label: "Instagram",
      url: "https://www.instagram.com/kat839487582",
      img: "/img/instagram.jpg",
      rounded: false,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Info className={styles.headerIcon} size={28} />
        <h1 className={styles.title}>{t("info.title")}</h1>
      </div>

      <div className={styles.content}>
        <Card className={styles.aboutCard}>
          <div className={styles.aboutHeader}>
            <div className={styles.aboutIconWrapper}>
              <GraduationCap size={26} />
            </div>
            <h2 className={styles.aboutTitle}>{t("info.about.title")}</h2>
          </div>

          <p className={styles.aboutDesc}>{t("info.about.description")}</p>

          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.key} className={styles.featureItem}>
                {feature.icon}
                <div className={styles.featureContent}>
                  <span className={styles.featureTitle}>
                    {t(`info.about.features.${feature.key}.title`)}
                  </span>
                  <span className={styles.featureText}>
                    {t(`info.about.features.${feature.key}.text`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <HelpCircle size={20} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>{t("info.faq.title")}</h2>
          </div>
          <div className={styles.faqList}>
            {FAQ_KEYS.map((key) => (
              <FAQItem
                key={key}
                question={t(`info.faq.${key}`)}
                answer={t(`info.faq.${key.replace("q", "a")}`)}
              />
            ))}
          </div>
        </section>

        <div className={styles.bottomGrid}>
          <Card className={styles.authorCard}>
            <h3 className={styles.authorName}>{t("info.author.name")}</h3>
            <p className={styles.authorStatus}>
              <MapPin size={14} className={styles.pinIcon} />
              {t("info.author.status")}
            </p>
            <p className={styles.authorBio}>{t("info.author.bio")}</p>
          </Card>

          <Card className={styles.contactsCard}>
            <h3 className={styles.contactsTitle}>{t("info.contacts.title")}</h3>
            <div className={styles.socialGrid}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={link.label}
                >
                  <img
                    src={link.img}
                    alt={link.label}
                    className={`${styles.socialImg} ${link.rounded ? styles.socialImgRound : ""}`}
                  />
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
