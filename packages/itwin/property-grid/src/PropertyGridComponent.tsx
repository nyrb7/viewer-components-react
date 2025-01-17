/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useEffect } from "react";
import { useActiveIModelConnection, useSpecificWidgetDef, WidgetState } from "@itwin/appui-react";
import { Presentation } from "@itwin/presentation-frontend";
import { MultiElementPropertyGrid } from "./components/MultiElementPropertyGrid";
import { PreferencesContextProvider } from "./PropertyGridPreferencesContext";

import type { MultiElementPropertyGridProps } from "./components/MultiElementPropertyGrid";
import type { PreferencesStorage } from "./api/PreferencesStorage";

/**
 * Id of the property grid widget created by `PropertyGridUiItemsProvider`.
 * @public
 */
export const PropertyGridComponentId = "vcr:PropertyGridComponent";

/**
 * Props for `PropertyGridComponent`.
 * @public
 */
export interface PropertyGridComponentProps extends Omit<MultiElementPropertyGridProps, "imodel"> {
  /**
   * Custom storage that should be used for persisting preferences.
   * Defaults to `IModelAppUserPreferencesStorage` that uses `IModelApp.userPreferences`.
   */
  preferencesStorage?: PreferencesStorage;
}

/**
 * Component that renders `MultiElementPropertyGrid` if there is active iModel connection.
 * @public
 */
export function PropertyGridComponent({ preferencesStorage, ...props }: PropertyGridComponentProps) {
  const imodel = useActiveIModelConnection();
  if (!imodel) {
    return null;
  }

  return <PreferencesContextProvider storage={preferencesStorage}>
    <PropertyGridComponentContent {...props} imodel={imodel} />
  </PreferencesContextProvider>;
}

/** Component that renders `MultiElementPropertyGrid` an hides/shows widget based on `UnifiedSelection`. */
function PropertyGridComponentContent(props: MultiElementPropertyGridProps) {
  const widgetDef = useSpecificWidgetDef(PropertyGridComponentId);

  useEffect(() => {
    if (!widgetDef) {
      return;
    }

    return Presentation.selection.selectionChange.addListener((args) => {
      const keys = Presentation.selection.getSelection(args.imodel);
      widgetDef.setWidgetState(keys.isEmpty ? WidgetState.Hidden : WidgetState.Open);
    });
  }, [widgetDef]);

  return <MultiElementPropertyGrid {...props} />;
}
