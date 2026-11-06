from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectMetric(BaseModel):
    label: str
    value: str
    description: str


class ChallengeSolution(BaseModel):
    challenge: str
    solution: str
    impact: str


class TechRationale(BaseModel):
    technology: str
    role: str
    rationale: str


class ArchitectureComponent(BaseModel):
    name: str
    description: str
    tech: str


class SimulatedDemoStep(BaseModel):
    command: str
    output: str


class ProjectSummaryResponse(BaseModel):
    slug: str
    title: str
    tagline: str
    category: str
    tags: List[str]
    github_url: str
    demo_url: Optional[str] = None
    stars: int = Field(default=0)
    forks: int = Field(default=0)
    language: Optional[str] = None
    pushed_at: Optional[str] = None


class ProjectDetailResponse(ProjectSummaryResponse):
    architecture_overview: str
    components: List[ArchitectureComponent]
    challenges: List[ChallengeSolution]
    tech_rationale: List[TechRationale]
    metrics: List[ProjectMetric]
    demo_instructions: str
    simulated_steps: List[SimulatedDemoStep]
