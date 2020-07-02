import React from 'react'

const getAllParents = (element: HTMLElement): readonly Node[] => {
  const mutableParents: Node[] = []
  let currentNode: Node | null = element

  while (currentNode) {
    currentNode !== element && mutableParents.push(currentNode)
    currentNode = currentNode.parentNode
  }

  return mutableParents
}

/** Запрос репозиции тултипа при ресайзе окна и скролле */
export const useTooltipReposition = ({
  isActive,
  scrollAnchorRef,
  onRequestReposition,
}: {
  isActive: boolean
  /** При скролле родителей этого элемента будет запрашиваться репозиция тултипа */
  scrollAnchorRef: React.RefObject<HTMLElement | null>
  onRequestReposition: () => void
}) => {
  React.useEffect(() => {
    if (isActive) {
      window.addEventListener('resize', onRequestReposition)

      const allParents = scrollAnchorRef?.current ? getAllParents(scrollAnchorRef.current) : []
      allParents.forEach(parentEl => parentEl.addEventListener('scroll', onRequestReposition))

      return () => {
        window.removeEventListener('resize', onRequestReposition)

        allParents.forEach(parentEl => parentEl.removeEventListener('scroll', onRequestReposition))
      }
    }
  }, [isActive, scrollAnchorRef, onRequestReposition])
}