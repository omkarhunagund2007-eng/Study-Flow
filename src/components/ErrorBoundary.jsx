import { Component } from 'react';

/**
 * Catches unexpected errors while rendering so the user sees a helpful message
 * instead of a blank page. (Error boundaries must be class components - this is
 * the one place in the project where a class is required.)
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('StudyFlow crashed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="fatal">
        <h1>Something went wrong</h1>
        <p>StudyFlow hit an unexpected problem. Your saved data is still in your browser. Reloading usually fixes it.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    );
  }
}
