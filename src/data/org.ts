export type OrgUnit = { 유닛명: string | null; 팀: string[] };
export type OrgItem = { 본부: string; 유닛: OrgUnit[] };

export const ORG: OrgItem[] = [
  {
    본부: '병원사업본부',
    유닛: [
      { 유닛명: null, 팀: ['초음파사업팀', 'PACS사업팀', '미소몰사업팀', '미소몰리뉴얼TF'] },
      { 유닛명: '사업기획유닛', 팀: ['사업기획팀', '운영기획팀'] },
      { 유닛명: 'EMR사업유닛', 팀: ['EMR사업1팀', 'EMR사업2팀'] },
    ],
  },
  {
    본부: '약국사업본부',
    유닛: [
      { 유닛명: null, 팀: ['약국사업팀', '신규사업팀', '약국영업1팀', '오토팩사업팀', '3초ERP팀', 'PALESSTF', '약국영업2팀'] },
    ],
  },
  {
    본부: '제약사업본부',
    유닛: [
      { 유닛명: null, 팀: ['데이터사업팀', 'CRM사업팀', '마케팅PM팀', '데이터PM팀', '마케팅사업팀'] },
    ],
  },
  {
    본부: 'IT개발본부',
    유닛: [
      { 유닛명: 'UX유닛', 팀: ['의사랑기획품질팀', '제약기획품질팀', '제약데이터기획팀', '디자인팀'] },
      { 유닛명: '기반개발유닛', 팀: ['의사랑운영개발팀', '유팜개발팀', '제약CRM개발팀', 'UBIST개발팀', '의사랑전략개발팀'] },
      { 유닛명: '부가개발유닛', 팀: ['제약부가개발팀', '전략개발팀', '병원부가개발팀'] },
      { 유닛명: null, 팀: ['AX개발팀'] },
    ],
  },
  {
    본부: 'SO본부',
    유닛: [
      { 유닛명: null, 팀: ['영업관리팀', '약국고객팀', '병원고객팀', 'IT보안팀'] },
      { 유닛명: '고객가치혁신유닛', 팀: ['고객가치기획팀', '고객가치개발팀'] },
    ],
  },
  {
    본부: '경영지원본부',
    유닛: [
      { 유닛명: null, 팀: ['경영관리팀', 'IT보안팀(GC)'] },
    ],
  },
  {
    본부: '경영지원본부(GC)',
    유닛: [
      { 유닛명: '인사문화유닛(GC)', 팀: ['기업문화팀(GC)', '인사지원팀(GC)'] },
      { 유닛명: '경영관리유닛(GC)', 팀: ['회계팀(GC)', '기획조정팀(GC)', '자금팀(GC)'] },
      { 유닛명: '기업커뮤니케이션유닛(GC)', 팀: ['IPR팀(GC)', '법무팀(GC)'] },
    ],
  },
  {
    본부: 'PI본부',
    유닛: [
      { 유닛명: 'CloudEMR유닛', 팀: ['EMR개발팀', 'UX기획팀', '부가개발팀', '플랫폼구축TF'] },
      { 유닛명: null, 팀: ['AI서비스팀', '데이터플랫폼팀'] },
    ],
  },
];

export function getUnitList(본부: string) {
  const bhData = ORG.find((o) => o.본부 === 본부);
  return bhData?.유닛.filter((u) => u.유닛명 !== null) ?? [];
}

export function getTeamList(본부: string, 유닛?: string): string[] {
  const bhData = ORG.find((o) => o.본부 === 본부);
  if (!bhData) return [];
  const noUnitTeams = bhData.유닛.filter((u) => u.유닛명 === null).flatMap((u) => u.팀);
  const unitList = bhData.유닛.filter((u) => u.유닛명 !== null);
  if (unitList.length === 0) return bhData.유닛.flatMap((u) => u.팀);
  const unitTeams = 유닛 ? (bhData.유닛.find((u) => u.유닛명 === 유닛)?.팀 ?? []) : [];
  return [...noUnitTeams, ...unitTeams];
}