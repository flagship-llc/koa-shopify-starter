import React from "react";
import {AppProvider, EmptyState} from "@shopify/polaris";
import translations from '@shopify/polaris/locales/en.json';

export default class App extends React.Component {
  render() {
    return (
      <AppProvider i18n={translations}>
        <EmptyState
          heading="Empty content! Modify me"
          action={{content: "Nothing here"}}
          image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
        >
          <p>Lorem Ipsum</p>
        </EmptyState>
      </AppProvider>
    );
  }
}
