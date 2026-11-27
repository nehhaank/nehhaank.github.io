import { Component, type ReactNode } from 'react'

// If one toy ever throws, only that toy goes quiet; the rest of the page stays put.
export class ToyBoundary extends Component<{ children: ReactNode }, { broken: boolean }> {
  state = { broken: false }
  static getDerivedStateFromError() {
    return { broken: true }
  }
  componentDidCatch(error: unknown) {
    console.error(error)
  }
  render() {
    return this.state.broken ? null : this.props.children
  }
}
