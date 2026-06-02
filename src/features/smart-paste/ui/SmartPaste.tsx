import React, { useState, useRef, useEffect } from 'react';
import { ClipboardPaste, X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAcademicRecordStore } from '../../../entities/academic-record/model/store';
import styles from './SmartPaste.module.scss';

export const SmartPaste = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { setFOS, setSORS, setSOCH, resetAll } = useAcademicRecordStore();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    
    if (!text) return;
    
    setInputValue(text);
    parseAndApplyGrades(text);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const diff = Math.abs(newValue.length - inputValue.length);
    
    setInputValue(newValue);
    
    if (diff > 4) {
      parseAndApplyGrades(newValue);
      setIsOpen(false);
    }
  };

  const handleApply = () => {
    if (!inputValue.trim()) return;
    parseAndApplyGrades(inputValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const parseAndApplyGrades = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return;

    resetAll();

    const newFos: number[] = [];
    const parsedSors: {score: number, max: number}[] = [];
    let parsedSoch: {score: number, max: number} | null = null;
    let seenFraction = false;

    for (const word of words) {
      if (/^\d+\/\d+$/.test(word)) {
        seenFraction = true;
        const [s, m] = word.split('/').map(Number);
        if (m > 0 && s <= m) {
          parsedSors.push({ score: s, max: m });
        }
      } else if (/^\d+$/.test(word)) {
        const num = Number(word);
        if (!seenFraction && num > 0 && num <= 10) {
          newFos.push(num);
        }
      }
    }

    if (parsedSors.length > 0) {
      const last = parsedSors[parsedSors.length - 1];
      if (last.max >= 20) {
        parsedSoch = last;
        parsedSors.pop();
      }
    }

    setFOS(newFos);
    
    const newSorsArray = Array.from({ length: 4 }, (_, i) => {
      if (i < parsedSors.length) {
        return { 
          id: crypto.randomUUID(), 
          score: parsedSors[i].score, 
          max: parsedSors[i].max 
        };
      }
      return { id: crypto.randomUUID(), score: null, max: null };
    });
    setSORS(newSorsArray);
    
    if (parsedSoch) {
      setSOCH({ score: parsedSoch.score, max: parsedSoch.max });
    }
  };

  return (
    <>
      <button 
        className={styles.triggerBtn} 
        onClick={() => {
          setInputValue('');
          setIsOpen(true);
        }}
      >
        <ClipboardPaste size={20} />
        <span>{t('smart_paste.btn')}</span>
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div className={styles.titleWrapper}>
                <h3>{t('smart_paste.title')}</h3>
                <div className={styles.tooltipWrapper}>
                  <HelpCircle size={16} className={styles.helpIcon} />
                  <div className={styles.tooltipContent}>
                    {t('smart_paste.mobile_tip')}
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.body}>
                  <p className={styles.instruction}>
                    {t('smart_paste.instruction')}
                  </p>
                  <input
                    ref={inputRef}
                    type="text"
                    className={styles.pasteInput}
                    placeholder={t('smart_paste.placeholder')}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                  />
                  <button 
                    className={styles.applyBtn} 
                    onClick={handleApply}
                    disabled={!inputValue.trim()}
                  >
                    {t('smart_paste.apply_btn')}
                  </button>
                  <div className={styles.demoBox}>
                    <span>{t('smart_paste.example_label')}</span>
                    <div className={styles.demoText}>
                      {t('smart_paste.example_text')}
                    </div>
                  </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
