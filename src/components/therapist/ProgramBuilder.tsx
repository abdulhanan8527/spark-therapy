import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Archive, Check, X, Target, BookOpen, Filter } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  ABLLS_SKILLS, 
  DOMAIN_COLORS, 
  Program, 
  ProgramTarget, 
  DataCollectionMethod,
  TherapistSpecialty,
  ABLLSSkill
} from './ProgramBuilderTypes';

interface ProgramBuilderProps {
  therapistSpecialty: TherapistSpecialty;
  childName: string;
}

export default function ProgramBuilder({ therapistSpecialty, childName }: ProgramBuilderProps) {
  // State for programs
  const [programs, setPrograms] = useState<Program[]>([
    // Sample ABLLS-R program
    {
      id: '1',
      childId: 'emma-johnson',
      therapistId: 'dr-smith',
      title: 'A15',
      code: 'A15',
      domain: 'A',
      shortDescription: 'Observes instructor for feedback',
      longDescription: 'Child looks toward the instructor after completing a task to receive feedback or reinforcement.',
      masteryCriteria: 'Child consistently looks toward instructor 4 out of 5 trials across 3 consecutive sessions.',
      dataCollectionMethod: 'trial-by-trial',
      targets: [
        { id: 't1', description: 'Looks at instructor after completing puzzle', mastered: true, masteryDate: '2025-12-01' },
        { id: 't2', description: 'Looks at instructor after stacking blocks', mastered: true, masteryDate: '2025-12-03' },
        { id: 't3', description: 'Looks at instructor after coloring', mastered: false },
      ],
      isActive: true,
      createdAt: '2025-11-01',
      updatedAt: '2025-12-05'
    },
    // Sample custom program
    {
      id: '2',
      childId: 'emma-johnson',
      therapistId: 'dr-smith',
      title: '/k/ in initial position',
      category: 'Articulation',
      shortDescription: 'Producing /k/ sound in initial position of words',
      longDescription: 'Child will produce the /k/ sound correctly in the initial position of words during structured therapy activities.',
      masteryCriteria: '80% accuracy across 3 consecutive sessions with mixed consonants.',
      dataCollectionMethod: 'frequency',
      targets: [
        { id: 't4', description: 'Say "cat"', mastered: false },
        { id: 't5', description: 'Say "car"', mastered: false },
        { id: 't6', description: 'Say "cup"', mastered: false },
        { id: 't7', description: 'Say "key"', mastered: false },
      ],
      isActive: true,
      createdAt: '2025-12-01',
      updatedAt: '2025-12-05'
    }
  ]);

  // State for form inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [showABLLSForm, setShowABLLSForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newProgramCodes, setNewProgramCodes] = useState('');
  const [customProgram, setCustomProgram] = useState({
    title: '',
    category: '',
    shortDescription: '',
    longDescription: '',
    masteryCriteria: '',
    dataCollectionMethod: 'trial-by-trial' as DataCollectionMethod
  });
  
  // State for autocomplete
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<ABLLSSkill[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Filter programs based on search
  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return programs;
    
    return programs.filter(program => 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);
  
  // Handle autocomplete suggestions for ABLLS-R codes
  const handleAutocomplete = (value: string) => {
    setSearchQuery(value);
    
    if (value.length >= 1) {
      const suggestions = ABLLS_SKILLS.filter(skill =>
        skill.code.toLowerCase().startsWith(value.toLowerCase()) ||
        skill.description.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setAutocompleteSuggestions(suggestions);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };
  
  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (skill: ABLLSSkill) => {
    setSearchQuery('');
    setShowAutocomplete(false);
    
    // Add the selected skill as a program
    const newProgram: Program = {
      id: `prog-${Date.now()}-${Math.random()}`,
      childId: 'emma-johnson',
      therapistId: 'dr-smith',
      title: skill.code,
      code: skill.code,
      domain: skill.domain,
      shortDescription: skill.description,
      dataCollectionMethod: 'trial-by-trial',
      targets: [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setPrograms([...programs, newProgram]);
  };

  // Group programs by type
  const abllsPrograms = filteredPrograms.filter(p => p.domain);
  const customPrograms = filteredPrograms.filter(p => p.category);

  // Handle ABLLS-R program addition
  const handleAddABLLSPrograms = () => {
    const codes = newProgramCodes.split(/\s+/).filter(code => code.trim());
    
    const newPrograms: Program[] = codes.map(code => {
      const skill = ABLLS_SKILLS.find(s => s.code === code.toUpperCase());
      if (!skill) return null;
      
      return {
        id: `prog-${Date.now()}-${Math.random()}`,
        childId: 'emma-johnson',
        therapistId: 'dr-smith',
        title: skill.code,
        code: skill.code,
        domain: skill.domain,
        shortDescription: skill.description,
        dataCollectionMethod: 'trial-by-trial',
        targets: [],
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
    }).filter(Boolean) as Program[];

    setPrograms([...programs, ...newPrograms]);
    setNewProgramCodes('');
    setShowABLLSForm(false);
  };

  // Handle custom program creation
  const handleCreateCustomProgram = () => {
    const newProgram: Program = {
      id: `prog-${Date.now()}-${Math.random()}`,
      childId: 'emma-johnson',
      therapistId: 'dr-smith',
      title: customProgram.title,
      category: customProgram.category,
      shortDescription: customProgram.shortDescription,
      longDescription: customProgram.longDescription,
      masteryCriteria: customProgram.masteryCriteria,
      dataCollectionMethod: customProgram.dataCollectionMethod,
      targets: [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setPrograms([...programs, newProgram]);
    setCustomProgram({
      title: '',
      category: '',
      shortDescription: '',
      longDescription: '',
      masteryCriteria: '',
      dataCollectionMethod: 'trial-by-trial'
    });
    setShowCustomForm(false);
  };

  // Handle adding a target to a program
  const handleAddTarget = (programId: string, targetDescription: string) => {
    if (!targetDescription.trim()) return;
    
    setPrograms(programs.map(program => {
      if (program.id === programId) {
        const newTarget: ProgramTarget = {
          id: `target-${Date.now()}`,
          description: targetDescription,
          mastered: false
        };
        return {
          ...program,
          targets: [...program.targets, newTarget],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return program;
    }));
  };

  // Handle toggling target mastery
  const handleToggleTarget = (programId: string, targetId: string) => {
    setPrograms(programs.map(program => {
      if (program.id === programId) {
        const updatedTargets = program.targets.map(target => {
          if (target.id === targetId) {
            return {
              ...target,
              mastered: !target.mastered,
              masteryDate: !target.mastered ? new Date().toISOString().split('T')[0] : undefined
            };
          }
          return target;
        });
        
        return {
          ...program,
          targets: updatedTargets,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return program;
    }));
  };

  // Handle archiving a program
  const handleArchiveProgram = (programId: string) => {
    setPrograms(programs.map(program => {
      if (program.id === programId) {
        return {
          ...program,
          isActive: false,
          archivedAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return program;
    }));
  };

  // Render program card
  const renderProgramCard = (program: Program) => {
    const [newTarget, setNewTarget] = useState('');

    return (
      <div key={program.id} className="mb-4">
        <Card>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {program.domain && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${DOMAIN_COLORS[program.domain]}`}>
                    {program.domain}
                  </span>
                )}
                {program.category && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {program.category}
                  </span>
                )}
                <h3 className="text-gray-900 font-medium">{program.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{program.shortDescription}</p>
            </div>
            <div className="flex gap-1">
              <button className="p-1 text-gray-500 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button 
                className="p-1 text-gray-500 hover:text-red-600"
                onClick={() => handleArchiveProgram(program.id)}
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>

          {program.longDescription && (
            <p className="text-gray-700 text-sm mb-3">{program.longDescription}</p>
          )}

          {program.masteryCriteria && (
            <div className="mb-3">
              <p className="text-gray-700 text-sm font-medium mb-1">Mastery Criteria:</p>
              <p className="text-gray-600 text-sm">{program.masteryCriteria}</p>
            </div>
          )}

          <div className="mb-3">
            <p className="text-gray-700 text-sm font-medium mb-2">Targets:</p>
            {program.targets.length > 0 ? (
              <div className="space-y-2">
                {program.targets.map(target => (
                  <div key={target.id} className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleTarget(program.id, target.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        target.mastered 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      {target.mastered && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${
                      target.mastered ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}>
                      {target.description}
                    </span>
                    {target.mastered && target.masteryDate && (
                      <span className="text-xs text-green-600">{target.masteryDate}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No targets added yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Add new target..."
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                handleAddTarget(program.id, newTarget);
                setNewTarget('');
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Program Builder</h2>
          <p className="text-teal-100 text-sm">Managing therapy programs for {childName}</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Search and Filters */}
          <Card className="mb-4">
            <div className="relative mb-3">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              {(therapistSpecialty === 'aba' || therapistSpecialty === 'behavior-analyst') && (
                <button
                  onClick={() => setShowABLLSForm(!showABLLSForm)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  ABLLS-R
                </button>
              )}
              
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Custom
              </button>
            </div>
          </Card>

          {/* ABLLS-R Quick Add Form */}
          {showABLLSForm && (
            <Card className="mb-4 bg-purple-50 border-purple-200">
              <h3 className="text-gray-900 mb-3">Add ABLLS-R Programs</h3>
              <p className="text-gray-600 text-sm mb-3">
                Enter ABLLS-R codes separated by spaces (e.g., "A15 C15 G10 Y8")
              </p>
              <textarea
                value={newProgramCodes}
                onChange={(e) => setNewProgramCodes(e.target.value)}
                placeholder="A15 C15 G10 Y8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddABLLSPrograms}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm"
                >
                  Add Programs
                </button>
                <button
                  onClick={() => setShowABLLSForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </Card>
          )}

          {/* Custom Program Form */}
          {showCustomForm && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <h3 className="text-gray-900 mb-3">Create Custom Program</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Program Name</label>
                  <input
                    type="text"
                    value={customProgram.title}
                    onChange={(e) => setCustomProgram({...customProgram, title: e.target.value})}
                    placeholder="e.g., /k/ in initial position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Category</label>
                  <input
                    type="text"
                    value={customProgram.category}
                    onChange={(e) => setCustomProgram({...customProgram, category: e.target.value})}
                    placeholder="e.g., Articulation, Expressive Language"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Short Description</label>
                  <input
                    type="text"
                    value={customProgram.shortDescription}
                    onChange={(e) => setCustomProgram({...customProgram, shortDescription: e.target.value})}
                    placeholder="Brief description of the program"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Detailed Description</label>
                  <textarea
                    value={customProgram.longDescription}
                    onChange={(e) => setCustomProgram({...customProgram, longDescription: e.target.value})}
                    placeholder="Detailed procedures and teaching methods"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Mastery Criteria</label>
                  <input
                    type="text"
                    value={customProgram.masteryCriteria}
                    onChange={(e) => setCustomProgram({...customProgram, masteryCriteria: e.target.value})}
                    placeholder="e.g., 80% accuracy across 3 sessions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Data Collection Method</label>
                  <select
                    value={customProgram.dataCollectionMethod}
                    onChange={(e) => setCustomProgram({
                      ...customProgram, 
                      dataCollectionMethod: e.target.value as DataCollectionMethod
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="trial-by-trial">Trial-by-Trial</option>
                    <option value="frequency">Frequency</option>
                    <option value="duration">Duration</option>
                    <option value="rubric">Rubric</option>
                    <option value="prompt-level">Prompt Level</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCustomProgram}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
                  >
                    Create Program
                  </button>
                  <button
                    onClick={() => setShowCustomForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* ABLLS-R Programs Section */}
          {abllsPrograms.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">ABLLS-R Programs</h3>
                <span className="text-gray-500 text-sm">{abllsPrograms.length} programs</span>
              </div>
              {abllsPrograms.map(renderProgramCard)}
            </div>
          )}

          {/* Custom Programs Section */}
          {customPrograms.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Custom Programs</h3>
                <span className="text-gray-500 text-sm">{customPrograms.length} programs</span>
              </div>
              {customPrograms.map(renderProgramCard)}
            </div>
          )}

          {/* Empty State */}
          {filteredPrograms.length === 0 && (
            <Card className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-1">No Programs Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery 
                  ? `No programs match "${searchQuery}"` 
                  : 'Add programs to get started'}
              </p>
              <div className="flex gap-2 justify-center">
                {(therapistSpecialty === 'aba' || therapistSpecialty === 'behavior-analyst') && (
                  <button
                    onClick={() => setShowABLLSForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                  >
                    Add ABLLS-R
                  </button>
                )}
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Create Custom
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}