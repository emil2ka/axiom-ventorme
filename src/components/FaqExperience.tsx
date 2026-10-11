import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { track } from '../lib/events';
import './faq/faq.css';

const faq = [
  {
    question: 'Нужно уже знать, кем я хочу стать?',
    answer:
      'Нет. Подборка на этой странице помогает начать знакомство с направлениями. Выбор можно менять.',
  },
  {
    question: 'Это настоящий профориентационный тест?',
    answer:
      'Нет. Здесь короткая подборка по выбранным интересам. Она не заменяет полноценный тест. С возможностями профориентации можно познакомиться в Ventorme.',
  },
  {
    question: 'Где нужно регистрироваться?',
    answer: 'В Ventorme. Кнопки регистрации на этой странице ведут на платформу.',
  },
  {
    question: 'Что доступно без регистрации?',
    answer:
      'На этой странице — выбор интересов, направления для знакомства и небольшие задания. Условия функций Ventorme проверяй на самой платформе.',
  },
  {
    question: 'Сохранятся ли мои ответы в Ventorme?',
    answer:
      'В текущей версии ответы с этой страницы автоматически не передаются в аккаунт Ventorme.',
  },
  {
    question: 'А если мне подходят несколько направлений?',
    answer:
      'Это нормально. Начни с небольшого задания, сравни опыт и изучи другие варианты. Подборка не закрепляет за тобой одну профессию.',
  },
  {
    question: 'Зачем проходить начальную настройку?',
    answer:
      'Это часть начала работы в Ventorme: платформа подстраивается под тебя. Подробности — в самом продукте.',
  },
];

type FaqSource = 'list' | 'accordion';

const pad = (index: number) => String(index + 1).padStart(2, '0');

export default function FaqExperience() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [active, setActive] = useState(0);
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const openQuestion = (index: number, source: FaqSource) => {
    if (trackedRef.current.has(index)) return;
    trackedRef.current.add(index);
    track('faq_open', { question: index + 1, source });
  };

  const selectQuestion = (index: number) => {
    setActive(index);
    openQuestion(index, 'list');
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectQuestion(Math.min(active + 1, faq.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectQuestion(Math.max(active - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectQuestion(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectQuestion(faq.length - 1);
    }
  };

  const activeItem = faq[active];

  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="container">
        <div className="section-head">
          <h2 className="h2" id="faq-title">
            Частые вопросы
          </h2>
        </div>

        {isDesktop ? (
          <div className="vp-faq-desktop">
            <div className="vp-faq-index" onKeyDown={handleKeyDown}>
              {faq.map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  className="vp-faq-entry"
                  data-active={index === active}
                  aria-pressed={index === active}
                  aria-controls="vp-faq-answer"
                  onClick={() => selectQuestion(index)}
                >
                  <span className="vp-faq-entry-num" aria-hidden="true">
                    {pad(index)}
                  </span>
                  <span className="vp-faq-entry-text">{item.question}</span>
                </button>
              ))}
            </div>

            <div className="vp-faq-plate">
              <div className="vp-faq-plate-layer" aria-hidden="true" />
              <div className="vp-faq-plate-layer" aria-hidden="true" />
              <div className="vp-faq-plate-face">
                <div className="vp-faq-live" id="vp-faq-answer" aria-live="polite" aria-atomic="true">
                  <div className="vp-faq-answer-body" key={active}>
                    <h3 className="vp-faq-answer-title">{activeItem.question}</h3>
                    <p className="vp-faq-answer-text">{activeItem.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="vp-faq-accordion">
            {faq.map((item, index) => (
              <details
                key={item.question}
                className="vp-faq-item"
                onToggle={(event) => {
                  if (event.currentTarget.open) openQuestion(index, 'accordion');
                }}
              >
                <summary className="vp-faq-summary">
                  <span className="vp-faq-summary-num" aria-hidden="true">
                    {pad(index)}
                  </span>
                  <span className="vp-faq-summary-text">{item.question}</span>
                  <span className="vp-faq-summary-icon" aria-hidden="true" />
                </summary>
                <div className="vp-faq-collapse">
                  <div className="vp-faq-collapse-inner">
                    <p className="vp-faq-accordion-answer">{item.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
