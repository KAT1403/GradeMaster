import React, { useState, useRef, useEffect } from 'react';
import { ClipboardPaste, X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAcademicRecordStore } from '../../../entities/academic-record/model/store';
import styles from './SmartPaste.module.scss';

export const SmartPaste = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [pasteMode, setPasteMode] = useState<'quarter' | 'half_year'>('quarter');
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
    
    setInputValue(prev => prev ? `${prev} ${text}` : text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleApply = () => {
    if (!inputValue.trim()) return;
    parseAndApplyGrades(inputValue, pasteMode);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const parseAndApplyGrades = (text: string, currentMode: 'quarter' | 'half_year') => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return;

    resetAll();

    const newFos: number[] = [];
    const parsedSors: {score: number, max: number}[] = [];
    let parsedSoch: {score: number, max: number} | null = null;

    if (currentMode === 'half_year') {
      let state: 'q1_fos' | 'q1_sors' | 'q2_fos' | 'q2_sors' = 'q1_fos';

      for (const word of words) {
        const isFraction = /^\d+\/\d+$/.test(word);
        const isInteger = /^\d+$/.test(word);

        if (isFraction) {
          const [s, m] = word.split('/').map(Number);
          if (m > 0 && s <= m) {
            if (state === 'q1_fos') {
              state = 'q1_sors';
            } else if (state === 'q2_fos') {
              state = 'q2_sors';
            }
            parsedSors.push({ score: s, max: m });
          }
        } else if (isInteger) {
          const num = Number(word);
          if (num > 0 && num <= 10) {
            if (state === 'q1_fos') {
              newFos.push(num);
            } else if (state === 'q1_sors') {
              state = 'q2_fos';
              newFos.push(num);
            } else if (state === 'q2_fos') {
              newFos.push(num);
            }
          }
        }
      }
    } else {
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
    } else {
      setSOCH(null);
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

                  <div className={styles.modeSelector}>
                    <button
                      type="button"
                      className={`${styles.modeTab} ${pasteMode === 'quarter' ? styles.active : ''}`}
                      onClick={() => setPasteMode('quarter')}
                    >
                      {t('smart_paste.mode_quarter')}
                    </button>
                    <button
                      type="button"
                      className={`${styles.modeTab} ${pasteMode === 'half_year' ? styles.active : ''}`}
                      onClick={() => setPasteMode('half_year')}
                    >
                      {t('smart_paste.mode_half_year')}
                    </button>
                  </div>

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
                      {pasteMode === 'half_year'
                        ? t('smart_paste.example_text_half_year')
                        : t('smart_paste.example_text')}
                    </div>
                  </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
