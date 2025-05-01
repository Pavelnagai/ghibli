import { viewport } from '@telegram-apps/sdk-react'
import { useMemo } from 'react'
import {useMobile} from "./useMobile";
import {useMocked} from "./useMocked";
import {pxToRem} from "../utils/pxToRem";

export const useTopSafeArea = (offset = 0) => {
	const { isMobile, isAndroid } = useMobile()
	const { isFullscreenMocked } = useMocked()

	const topPx = useMemo(() => {
		const viewportSafeTop = isFullscreenMocked ? 40 : viewport.safeAreaInsets().top
		return viewportSafeTop + viewport.contentSafeAreaInsets().top + offset
	}, [isFullscreenMocked, offset])
	const topRem = useMemo(() => {
		return pxToRem(topPx)
	}, [topPx])

	const bottomPx = useMemo(() => {
		const viewportSafeBottom = isFullscreenMocked ? 40 : viewport.safeAreaInsets().bottom
		return viewportSafeBottom + viewport.contentSafeAreaInsets().bottom + offset
	}, [isFullscreenMocked, offset])
	const bottomRem = useMemo(() => {
		return pxToRem(bottomPx)
	}, [bottomPx])

	const desktopOffset = !isMobile && !isFullscreenMocked ? 28 : 0
	const androidOffset = isAndroid ? 8 : 0
	const bottomNavigationPx = useMemo(() => {
		return bottomPx + androidOffset + desktopOffset
	}, [androidOffset, desktopOffset, bottomPx])
	const bottomNavigationRem = useMemo(() => {
		return pxToRem(bottomNavigationPx)
	}, [bottomNavigationPx])

	return {
		// top fullscreen offset. use pixels if you need to compute something
		topSafeAreaOffset: `${topRem}rem`,
		topSafeAreaOffsetPx: topPx,

		// if you need to use it for fixed elements then use bottomSafeAreaNavigationOffset instead
		bottomSafeAreaOffset: `${bottomRem}rem`,
		bottomSafeAreaOffsetPx: bottomPx,

		// safe bottom offset prevents from overlapping native navigation bars on mobiles
		// used for navigation component or fixed components above navigation
		// added android-specific offset to not overlay navigation bar
		// added desktop-specific offset cuz we don't have navigation bar at all
		bottomSafeAreaNavigationOffset: `${bottomNavigationRem}rem`,
		bottomSafeAreaNavigationOffsetPx: bottomNavigationPx,

		desktopOffset,
		androidOffset,
	}
}
