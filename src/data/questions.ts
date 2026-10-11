import type { CategoryId, GoalOption, InterestOption, ProjectOption } from '../lib/types';

export const questions = {
  q1: {
    id: 'q1',
    title: 'Какие занятия тебе ближе?',
    options: [
      {
        id: 'interest-tech',
        label: 'Делать сайты, приложения или устройства',
        hint: 'Мне нравится разбираться, как это работает',
        category: 'technology',
      },
      {
        id: 'interest-create',
        label: 'Придумывать и оформлять идеи',
        hint: 'Мне нравится создавать что-то своё',
        category: 'creativity',
      },
      {
        id: 'interest-research',
        label: 'Искать закономерности и объяснения',
        hint: 'Мне интересно задавать вопросы и проверять ответы',
        category: 'research',
      },
      {
        id: 'interest-people',
        label: 'Объяснять, поддерживать и работать с людьми',
        hint: 'Мне нравится взаимодействовать с людьми',
        category: 'people',
      },
      {
        id: 'interest-org',
        label: 'Организовывать проекты и доводить до результата',
        hint: 'Мне нравится собирать людей и планировать',
        category: 'organization',
      },
    ] satisfies InterestOption[],
  },
  q2: {
    id: 'q2',
    title: 'Какой небольшой проект ты бы попробовал?',
    options: [
      {
        id: 'project-page',
        label: 'Собрать простую страницу или приложение',
        category: 'technology',
      },
      {
        id: 'project-design',
        label: 'Сделать плакат, видео или интерфейс',
        category: 'creativity',
      },
      {
        id: 'project-data',
        label: 'Изучить данные и найти закономерность',
        category: 'research',
      },
      {
        id: 'project-interview',
        label: 'Провести интервью и объяснить тему другим',
        category: 'people',
      },
      {
        id: 'project-event',
        label: 'Организовать событие или командный проект',
        category: 'organization',
      },
    ] satisfies ProjectOption[],
  },
  q3: {
    id: 'q3',
    title: 'Что тебе полезнее сейчас?',
    options: [
      { id: 'professions', label: 'Познакомиться с профессиями' },
      { id: 'try', label: 'Понять, что можно попробовать самому' },
      { id: 'nextstep', label: 'Разобраться со следующим шагом к поступлению' },
    ] satisfies GoalOption[],
  },
} as const;

export function categoryOfInterest(id: string): CategoryId | null {
  const option = questions.q1.options.find((item) => item.id === id);
  return option ? option.category : null;
}

export function categoryOfProject(id: string): CategoryId | null {
  const option = questions.q2.options.find((item) => item.id === id);
  return option ? option.category : null;
}
