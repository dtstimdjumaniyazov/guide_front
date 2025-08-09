import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetInstitutionTypesQuery } from '../store/api/institutionsApi'
import { LoadingSpinner } from './Loading'

// interface Category {
//   id: number
//   name: string
//   description: string
//   icon: string
//   count?: number
// }

// Соответствие типов иконкам
const typeIcons: Record<string, string> = {
  'Детский сад': '🏠',
  'Кружок': '🎨', 
  'Спорт': '⚽',
  'Языковые школы': '📚',
  'Спортсекция': '🏃',
  'Детские сады': '🏫',
  'Ясли': '👶',
  // Добавьте другие типы по необходимости
}

const CategoryFilter: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: institutionTypes, isLoading } = useGetInstitutionTypesQuery()
  
  const currentTypeId = searchParams.get('institution_type_id')

  const handleCategoryClick = (typeId: number) => {
    const params = new URLSearchParams(searchParams)
    
    if (currentTypeId === String(typeId)) {
      // Если уже выбран этот тип, убираем фильтр
      params.delete('institution_type_id')
    } else {
      // Устанавливаем новый фильтр
      params.set('institution_type_id', String(typeId))
    }
    
    // Сбрасываем страницу на первую при смене фильтра
    params.delete('page')
    
    navigate(`/institutions?${params.toString()}`)
  }

  const handleShowAll = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('institution_type_id')
    params.delete('page')
    navigate(`/institutions?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!institutionTypes || institutionTypes.length === 0) {
    return null
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Категории учреждений
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выберите подходящую категорию, чтобы найти именно то, что нужно вашему ребенку
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {/* Кнопка "Все категории" */}
          <button
            onClick={handleShowAll}
            className={`group p-6 rounded-xl transition-all duration-300 text-center hover:shadow-lg ${
              !currentTypeId
                ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-4xl mb-3">🌟</div>
            <h3 className={`font-semibold mb-2 ${
              !currentTypeId ? 'text-blue-600' : 'text-gray-900'
            }`}>
              Все категории
            </h3>
            <p className="text-sm text-gray-600">
              Показать все учреждения
            </p>
          </button>

          {/* Категории типов учреждений */}
          {institutionTypes.map((type) => {
            const isSelected = currentTypeId === String(type.id)
            const icon = typeIcons[type.name] || '🏢'
            
            return (
              <button
                key={type.id}
                onClick={() => handleCategoryClick(type.id)}
                className={`group p-6 rounded-xl transition-all duration-300 text-center hover:shadow-lg ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className={`font-semibold mb-2 ${
                  isSelected ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {type.description || 'Найдите лучшие варианты для вашего ребенка'}
                </p>
              </button>
            )
          })}
        </div>

        {/* Индикатор текущего фильтра */}
        {currentTypeId && (
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              Фильтр: {institutionTypes.find(t => t.id === Number(currentTypeId))?.name}
              <button
                onClick={handleShowAll}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryFilter