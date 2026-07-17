from __future__ import annotations

from src.shared.queries.parameters import IParameters


class DummyParameters(IParameters):
    def __init__(self, page: int = 1):
        self.page = page


class TestIParameters:
    def test_is_instantiable_directly(self):

        parameters = IParameters()

        assert isinstance(parameters, IParameters)

    def test_subclasses_are_instances_of_iparameters(self):
        parameters = DummyParameters(page=2)

        assert isinstance(parameters, IParameters)
        assert parameters.page == 2
